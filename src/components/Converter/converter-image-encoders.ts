import { ConvertError } from './converter-errors.js';
import { traceImageDataToSvg } from './converter-svg-engine.js';

function imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw ConvertError.browserCanvas();
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export function encodeBmp(imageData: ImageData): ArrayBuffer {
  const { width, height, data } = imageData;
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelDataSize = rowSize * height;
  const fileSize = 54 + pixelDataSize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  view.setUint8(0, 0x42);
  view.setUint8(1, 0x4d);
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, -height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);

  let offset = 54;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      view.setUint8(offset++, data[i + 2] ?? 0);
      view.setUint8(offset++, data[i + 1] ?? 0);
      view.setUint8(offset++, data[i] ?? 0);
    }
    offset += rowSize - width * 3;
  }

  return buffer;
}

export function encodeTiff(imageData: ImageData): ArrayBuffer {
  const { width, height, data } = imageData;
  const numPixels = width * height;
  const imageBytes = new Uint8Array(numPixels * 3);
  for (let i = 0; i < numPixels; i++) {
    imageBytes[i * 3] = data[i * 4] ?? 0;
    imageBytes[i * 3 + 1] = data[i * 4 + 1] ?? 0;
    imageBytes[i * 3 + 2] = data[i * 4 + 2] ?? 0;
  }

  const bitsPerSample = new Uint16Array([8, 8, 8]);
  const ifdEntries = 10;
  const ifdSize = 2 + ifdEntries * 12 + 4;
  const bitsOffset = 8 + ifdSize;
  const imageOffset = bitsOffset + bitsPerSample.byteLength;
  const totalSize = imageOffset + imageBytes.byteLength;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  view.setUint16(0, 0x4949, true);
  view.setUint16(2, 42, true);
  view.setUint32(4, 8, true);
  view.setUint16(8, ifdEntries, true);

  let entry = 10;
  const writeEntry = (tag: number, type: number, count: number, value: number): void => {
    view.setUint16(entry, tag, true);
    view.setUint16(entry + 2, type, true);
    view.setUint32(entry + 4, count, true);
    view.setUint32(entry + 8, value, true);
    entry += 12;
  };

  writeEntry(256, 4, 1, width);
  writeEntry(257, 4, 1, height);
  writeEntry(258, 3, 3, bitsOffset);
  writeEntry(259, 3, 1, 1);
  writeEntry(262, 3, 1, 2);
  writeEntry(273, 4, 1, imageOffset);
  writeEntry(277, 3, 1, 3);
  writeEntry(278, 4, 1, height);
  writeEntry(279, 4, 1, imageBytes.byteLength);
  writeEntry(284, 3, 1, 1);
  view.setUint32(entry, 0, true);

  bytes.set(new Uint8Array(bitsPerSample.buffer), bitsOffset);
  bytes.set(imageBytes, imageOffset);
  return buffer;
}

export async function encodeIco(imageData: ImageData): Promise<ArrayBuffer> {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw ConvertError.browserCanvas();
  ctx.drawImage(imageDataToCanvas(imageData), 0, 0, size, size);

  const pngBlob = await canvasToBlob(canvas, 'image/png');
  const png = new Uint8Array(await pngBlob.arrayBuffer());
  const headerSize = 22;
  const buffer = new ArrayBuffer(headerSize + png.length);
  const view = new DataView(buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, 1, true);
  view.setUint8(6, size);
  view.setUint8(7, size);
  view.setUint8(8, 0);
  view.setUint8(9, 0);
  view.setUint16(10, 1, true);
  view.setUint16(12, 32, true);
  view.setUint32(14, png.length, true);
  view.setUint32(18, headerSize, true);
  new Uint8Array(buffer).set(png, headerSize);

  return buffer;
}

export async function encodeGif(imageData: ImageData): Promise<ArrayBuffer> {
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
  const { width, height, data } = imageData;
  const palette = quantize(data, 256);
  const index = applyPalette(data, palette);
  const gif = GIFEncoder();
  gif.writeFrame(index, width, height, { palette });
  gif.finish();
  const bytes = gif.bytes();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

export async function encodeSvg(imageData: ImageData): Promise<ArrayBuffer> {
  const svg = await traceImageDataToSvg(imageData);
  const encoded = new TextEncoder().encode(svg);
  return encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength);
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]!) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length, false);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)), false);
  return out;
}

/** PNG mono-image → APNG (1 frame). */
export function wrapPngAsApng(png: ArrayBuffer, width: number, height: number): ArrayBuffer {
  const src = new Uint8Array(png);
  if (src.length < 8) throw ConvertError.encodeFailed('apng');

  const parts: Uint8Array[] = [src.slice(0, 8)];
  let pos = 8;
  let insertedAcTL = false;
  let insertedFcTL = false;

  const acTLData = new Uint8Array(8);
  new DataView(acTLData.buffer).setUint32(0, 1, false);
  new DataView(acTLData.buffer).setUint32(4, 0, false);
  const acTL = pngChunk('acTL', acTLData);

  const fcTLBuf = new ArrayBuffer(26);
  const fcTLView = new DataView(fcTLBuf);
  fcTLView.setUint32(0, 0, false);
  fcTLView.setUint32(4, width, false);
  fcTLView.setUint32(8, height, false);
  fcTLView.setUint32(12, 0, false);
  fcTLView.setUint32(16, 0, false);
  fcTLView.setUint16(20, 0, false);
  fcTLView.setUint16(22, 100, false);
  fcTLView.setUint8(24, 0);
  fcTLView.setUint8(25, 0);
  const fcTL = pngChunk('fcTL', new Uint8Array(fcTLBuf));

  while (pos + 12 <= src.length) {
    const len = new DataView(src.buffer, src.byteOffset + pos, 4).getUint32(0, false);
    const type = String.fromCharCode(src[pos + 4]!, src[pos + 5]!, src[pos + 6]!, src[pos + 7]!);
    const end = pos + 12 + len;
    const chunk = src.slice(pos, end);

    if (type === 'IHDR' && !insertedAcTL) {
      parts.push(chunk, acTL);
      insertedAcTL = true;
    } else if (type === 'IDAT' && !insertedFcTL) {
      parts.push(fcTL, chunk);
      insertedFcTL = true;
    } else {
      parts.push(chunk);
    }

    pos = end;
    if (type === 'IEND') break;
  }

  if (!insertedAcTL || !insertedFcTL) throw ConvertError.encodeFailed('apng');

  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out.buffer;
}

async function canvasToBlob(canvas: HTMLCanvasElement, mime: string): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mime);
  });
  if (!blob) throw ConvertError.imageEncodeUnavailable(mime);
  return blob;
}

export async function encodeHeic(imageData: ImageData): Promise<ArrayBuffer> {
  const blob = await canvasToBlob(imageDataToCanvas(imageData), 'image/heic');
  return blob.arrayBuffer();
}

export async function encodeHeif(imageData: ImageData): Promise<ArrayBuffer> {
  const blob = await canvasToBlob(imageDataToCanvas(imageData), 'image/heif');
  return blob.arrayBuffer();
}
