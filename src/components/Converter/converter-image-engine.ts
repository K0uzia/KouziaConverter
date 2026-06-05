import type { OutputFormatOption } from '../../data/converter-output-formats.js';
import {
  ConvertError,
  validateFileWeight,
} from './converter-errors.js';
import {
  encodeBmp,
  encodeGif,
  encodeHeic,
  encodeHeif,
  encodeIco,
  encodeSvg,
  encodeTiff,
  wrapPngAsApng,
} from './converter-image-encoders.js';
import {
  extensionFromFile,
  isWebInputExtension,
} from '../../data/converter-limits.js';

export { ConvertError } from './converter-errors.js';

export type ProgressCallback = (ratio: number) => void;

export interface ConvertResult {
  blob: Blob;
  mime: string;
  filename: string;
}

const WASM_DECODE_EXTENSIONS = new Set(['png', 'jpeg', 'jpg', 'jfif', 'webp', 'avif', 'jxl']);

/** Décodage via createImageBitmap (GIF, SVG, BMP, TIFF, ICO, HEIC…). */
const BITMAP_DECODE_EXTENSIONS = new Set([
  'gif',
  'svg',
  'bmp',
  'tiff',
  'tif',
  'ico',
  'heic',
  'heif',
  'apng',
]);

const SVG_RASTER_MAX = 4096;
const SVG_RASTER_DEFAULT = 512;
/** Rasterisation haute résolution avant vectorisation (logos 80×74, etc.). */
const SVG_TRACE_RASTER_MIN = 1024;

async function decodeWithWasm(ext: string, buffer: ArrayBuffer): Promise<ImageData> {
  const normalized = ext === 'jpg' || ext === 'jfif' ? 'jpeg' : ext;
  if (normalized === 'png') {
    const { default: decode } = await import('@jsquash/png/decode');
    return decode(buffer);
  }
  if (normalized === 'jpeg') {
    const { default: decode } = await import('@jsquash/jpeg/decode');
    return decode(buffer);
  }
  if (normalized === 'webp') {
    const { default: decode } = await import('@jsquash/webp/decode');
    return decode(buffer);
  }
  if (normalized === 'avif') {
    const { default: decode } = await import('@jsquash/avif/decode');
    return decode(buffer);
  }
  if (normalized === 'jxl') {
    const { decode } = await import('@jsquash/jxl/decode');
    return decode(buffer);
  }
  throw ConvertError.unsupportedImageFormat(ext);
}

function parseSvgRasterSize(svgText: string): { width: number; height: number } | null {
  const widthMatch = svgText.match(/\bwidth=["']([\d.]+)/i);
  const heightMatch = svgText.match(/\bheight=["']([\d.]+)/i);
  const viewBoxMatch = svgText.match(/viewBox=["']([\d.\s,+-]+)["']/i);

  let width = widthMatch ? Number.parseFloat(widthMatch[1]) : Number.NaN;
  let height = heightMatch ? Number.parseFloat(heightMatch[1]) : Number.NaN;

  if (viewBoxMatch) {
    const parts = viewBoxMatch[1]
      .trim()
      .split(/[\s,]+/)
      .map((part) => Number.parseFloat(part));
    if (parts.length >= 4) {
      if (!Number.isFinite(width) || width <= 0) width = parts[2];
      if (!Number.isFinite(height) || height <= 0) height = parts[3];
    }
  }

  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return { width, height };
  }
  return null;
}

function clampSvgDimension(value: number): number {
  return Math.min(SVG_RASTER_MAX, Math.max(1, Math.round(value)));
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(ConvertError.svgUnreadable());
    img.src = src;
  });
}

function imageDataFromCanvas(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw ConvertError.browserCanvas();
  }
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (data.width === 0 || data.height === 0) {
    throw ConvertError.svgNoSize();
  }
  return data;
}

async function decodeSvgToImageData(file: File, forTracing = false): Promise<ImageData> {
  const svgText = await file.text();
  const parsed = parseSvgRasterSize(svgText);
  const url = URL.createObjectURL(
    new Blob([svgText], { type: file.type || 'image/svg+xml' }),
  );

  try {
    const img = await loadHtmlImage(url);
    let width = img.naturalWidth;
    let height = img.naturalHeight;

    if (!width || !height) {
      width = parsed?.width ?? SVG_RASTER_DEFAULT;
      height = parsed?.height ?? SVG_RASTER_DEFAULT;
    }

    if (forTracing) {
      const maxDim = Math.max(width, height);
      if (maxDim < SVG_TRACE_RASTER_MIN) {
        const ratio = SVG_TRACE_RASTER_MIN / maxDim;
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
    }

    width = clampSvgDimension(width);
    height = clampSvgDimension(height);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw ConvertError.browserCanvas();
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    return imageDataFromCanvas(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function decodeWithBitmap(file: File): Promise<ImageData> {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      throw ConvertError.browserCanvas();
    }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return imageDataFromCanvas(canvas);
  } catch {
    throw ConvertError.imageUnreadable();
  }
}

async function decodeBufferWithWasm(mime: string, buffer: ArrayBuffer): Promise<ImageData> {
  if (mime.includes('png')) {
    const { default: decode } = await import('@jsquash/png/decode');
    return decode(buffer);
  }
  if (mime.includes('jpeg') || mime.includes('jpg')) {
    const { default: decode } = await import('@jsquash/jpeg/decode');
    return decode(buffer);
  }
  if (mime.includes('webp')) {
    const { default: decode } = await import('@jsquash/webp/decode');
    return decode(buffer);
  }
  const blob = new Blob([buffer], { type: mime });
  return decodeWithBitmap(new File([blob], 'embedded', { type: mime }));
}

/** Extrait le raster embarqué d'un SVG « conteneur » (data URI dans `<image>`). */
async function decodeEmbeddedRasterFromSvg(file: File): Promise<ImageData | null> {
  const svgText = await file.text();
  const match = svgText.match(
    /<image\b[^>]*\b(?:href|xlink:href)\s*=\s*["'](data:image\/([^;]+);base64,([^"']+))["']/i,
  );
  if (!match) return null;

  const mime = `image/${match[2]!.toLowerCase()}`;
  const binary = atob(match[3]!);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  try {
    return await decodeBufferWithWasm(mime, bytes.buffer);
  } catch {
    return null;
  }
}

async function decodeToImageData(file: File): Promise<ImageData> {
  const ext = extensionFromFile(file);
  if (ext === 'svg') {
    return decodeSvgToImageData(file);
  }
  const buffer = await file.arrayBuffer();
  if (WASM_DECODE_EXTENSIONS.has(ext)) {
    return decodeWithWasm(ext, buffer);
  }
  return decodeWithBitmap(file);
}

async function encodePng(imageData: ImageData): Promise<ArrayBuffer> {
  const { default: encode } = await import('@jsquash/png/encode');
  return encode(imageData);
}

async function encodeImageData(imageData: ImageData, formatId: string): Promise<ArrayBuffer> {
  if (formatId === 'png') {
    return encodePng(imageData);
  }
  if (formatId === 'jpeg') {
    const { default: encode } = await import('@jsquash/jpeg/encode');
    return encode(imageData, { quality: 85 });
  }
  if (formatId === 'webp') {
    const { default: encode } = await import('@jsquash/webp/encode');
    return encode(imageData, { quality: 85 });
  }
  if (formatId === 'avif') {
    const { default: encode } = await import('@jsquash/avif/encode');
    return encode(imageData, { quality: 50 });
  }
  if (formatId === 'jxl') {
    const { encode } = await import('@jsquash/jxl/encode');
    return encode(imageData, { quality: 85 });
  }
  if (formatId === 'bmp') {
    return encodeBmp(imageData);
  }
  if (formatId === 'tiff') {
    return encodeTiff(imageData);
  }
  if (formatId === 'ico') {
    return encodeIco(imageData);
  }
  if (formatId === 'gif') {
    return encodeGif(imageData);
  }
  if (formatId === 'svg') {
    return encodeSvg(imageData);
  }
  if (formatId === 'apng') {
    const png = await encodePng(imageData);
    return wrapPngAsApng(png, imageData.width, imageData.height);
  }
  if (formatId === 'heic') {
    return encodeHeic(imageData);
  }
  if (formatId === 'heif') {
    return encodeHeif(imageData);
  }
  throw ConvertError.encodeFailed(formatId);
}

export function validateImageFile(file: File): void {
  validateFileWeight(file);
  const ext = extensionFromFile(file);
  const dotted = ext ? `.${ext}` : '';
  if (
    ext &&
    !isWebInputExtension(dotted) &&
    !WASM_DECODE_EXTENSIONS.has(ext) &&
    !BITMAP_DECODE_EXTENSIONS.has(ext)
  ) {
    throw ConvertError.unsupportedImageFormat(ext);
  }
}

/** Décodage image partagé (ex. export PDF). */
export async function decodeFileToImageData(file: File): Promise<ImageData> {
  return decodeToImageData(file);
}

function isEmbeddedRasterSvg(svgText: string): boolean {
  return /<image\b/i.test(svgText) || /\bhref\s*=\s*["']data:/i.test(svgText);
}

function hasVectorShapes(svgText: string): boolean {
  return /<(?:path|polygon|circle|rect|line|polyline|ellipse)\b/i.test(svgText);
}

function isAutoTracedSvg(svgText: string): boolean {
  return (
    /desc=["']Created with imagetracer/i.test(svgText) ||
    /Generator:\s*visioncortex VTracer/i.test(svgText)
  );
}

async function tryPassthroughVectorSvg(
  file: File,
  output: OutputFormatOption,
): Promise<ConvertResult | null> {
  if (output.id !== 'svg' || extensionFromFile(file) !== 'svg') return null;
  const svgText = await file.text();
  if (
    isEmbeddedRasterSvg(svgText) ||
    !hasVectorShapes(svgText) ||
    isAutoTracedSvg(svgText)
  ) {
    return null;
  }
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'converti';
  return {
    blob: new Blob([svgText], { type: output.mime }),
    mime: output.mime,
    filename: `${baseName}.${output.extension}`,
  };
}

export async function convertImageFile(
  file: File,
  output: OutputFormatOption,
  onProgress: ProgressCallback,
): Promise<ConvertResult> {
  validateImageFile(file);
  onProgress(0.05);
  const passthrough = await tryPassthroughVectorSvg(file, output);
  if (passthrough) {
    onProgress(1);
    return passthrough;
  }
  let imageData: ImageData;
  if (output.id === 'svg' && extensionFromFile(file) === 'svg') {
    const embedded = await decodeEmbeddedRasterFromSvg(file);
    imageData = embedded ?? (await decodeSvgToImageData(file, true));
  } else {
    imageData = await decodeToImageData(file);
  }
  onProgress(0.45);
  const encoded = await encodeImageData(imageData, output.id);
  onProgress(1);
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'converti';
  return {
    blob: new Blob([encoded], { type: output.mime }),
    mime: output.mime,
    filename: `${baseName}.${output.extension}`,
  };
}
