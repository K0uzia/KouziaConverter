import { convertFileSrc } from '@tauri-apps/api/core';
import type { OutputFormatOption } from '../../../src/data/converter-output-formats.ts';
import type { ConvertResult, ProgressCallback } from '../../../src/components/Converter/converter-image-engine.ts';
import { baseFilename } from '../../../src/components/Converter/converter-filename.ts';
import { getDesktopFilePath } from './app-desktop-file.ts';
import { ConvertError, validateFileWeight } from './app-converter-errors.ts';

const MAX_IMAGE_PIXELS = 32_000_000;

const CANVAS_OUTPUT_IDS = new Set(['webp', 'jpeg', 'png']);

const ENCODE_QUALITY: Record<string, number | undefined> = {
  webp: 0.85,
  jpeg: 0.85,
};

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(ConvertError.imageUnreadable());
    img.src = src;
  });
}

function constrainCanvasSize(width: number, height: number): { width: number; height: number } {
  const pixels = width * height;
  if (pixels <= MAX_IMAGE_PIXELS) {
    return { width, height };
  }
  const scale = Math.sqrt(MAX_IMAGE_PIXELS / pixels);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function loadDesktopImageBlob(desktopPath: string): Promise<string> {
  const assetUrl = convertFileSrc(desktopPath);
  const response = await fetch(assetUrl);
  if (!response.ok) {
    throw ConvertError.imageUnreadable();
  }
  const blob = await response.blob();
  if (!blob.size) {
    throw ConvertError.imageUnreadable();
  }
  return URL.createObjectURL(blob);
}

async function rasterizeToCanvas(file: File, sourcePath?: string): Promise<HTMLCanvasElement> {
  const desktopPath = sourcePath ?? getDesktopFilePath(file);
  let objectUrl: string | undefined;

  try {
    let img: HTMLImageElement;
    if (desktopPath) {
      objectUrl = await loadDesktopImageBlob(desktopPath);
      img = await loadHtmlImage(objectUrl);
    } else {
      objectUrl = URL.createObjectURL(file);
      img = await loadHtmlImage(objectUrl);
    }

    let width = img.naturalWidth;
    let height = img.naturalHeight;
    if (!width || !height) {
      throw ConvertError.imageUnreadable();
    }

    ({ width, height } = constrainCanvasSize(width, height));

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
    return canvas;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

async function canvasToBlob(canvas: HTMLCanvasElement, output: OutputFormatOption): Promise<Blob> {
  const quality = ENCODE_QUALITY[output.id];
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, output.mime, quality);
  });
  if (!blob || blob.size === 0) {
    throw ConvertError.encodeFailed(output.label);
  }
  return blob;
}

/**
 * Conversion image desktop via canvas WebKit (pas de WASM : le webview Tauri plante sinon).
 */
export async function convertImageFileDesktop(
  file: File,
  output: OutputFormatOption,
  onProgress: ProgressCallback,
  sourcePath?: string,
): Promise<ConvertResult> {
  validateFileWeight(file);
  if (!CANVAS_OUTPUT_IDS.has(output.id)) {
    throw ConvertError.desktopEncodeUnavailable(output.label);
  }

  onProgress(0.08);
  try {
    const canvas = await rasterizeToCanvas(file, sourcePath);
    onProgress(0.55);
    const blob = await canvasToBlob(canvas, output);
    onProgress(1);
    return {
      blob,
      mime: output.mime,
      filename: `${baseFilename(file)}.${output.extension}`,
    };
  } catch (err) {
    if (err instanceof ConvertError) throw err;
    console.error('convertImageFileDesktop', err);
    throw ConvertError.imageUnreadable();
  }
}
