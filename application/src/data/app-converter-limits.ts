import { formatsForEnv } from '../../../src/data/supported-formats.ts';
import { videoFormats } from '../../../src/data/video-formats.ts';
import { imageFormats } from '../../../src/data/image-formats.ts';
import {
  buildWebAcceptAttr,
  detectCategory as detectWebCategory,
  extensionFromFile,
  normalizeExtension,
  type ConverterCategory,
} from '../../../src/data/web-converter.ts';
import { formatBytes } from '../../../src/data/converter-limits.ts';

export type AppConverterCategory = ConverterCategory | 'video' | 'office';

const OFFICE_EXTENSIONS = new Set([
  'doc',
  'docx',
  'odt',
  'rtf',
  'xls',
  'xlsx',
  'ods',
  'ppt',
  'pptx',
  'odp',
  'psd',
  'eps',
  'nef',
  'cr2',
  'arw',
  'dng',
  'orf',
  'raf',
  'rw2',
]);

const VIDEO_EXTENSIONS = formatsForEnv(videoFormats, 'app').map((f) =>
  f.label.replace(/^\./, '').replace(/\*$/, '').toLowerCase(),
);

const APP_IMAGE_EXTENSIONS = formatsForEnv(imageFormats, 'app').map((f) =>
  f.label.replace(/^\./, '').replace(/\*$/, '').toLowerCase(),
);

/** Lot desktop : pas de plafond navigateur, mais borne haute pour éviter un OOM. */
export const WEB_MAX_BATCH_BYTES = 8 * 1024 * 1024 * 1024;
/** Images / WASM : limite pour éviter un crash du webview sur fichiers énormes. */
export const APP_MAX_IMAGE_FILE_BYTES = 96 * 1024 * 1024;
/** Vidéo / Office : transfert natif (staging disque), plafond plus haut. */
export const APP_MAX_NATIVE_FILE_BYTES = 2 * 1024 * 1024 * 1024;
export const WEB_MAX_TEXT_BYTES = 32 * 1024 * 1024;

export const WEB_ACCEPT_ATTR = buildAppAcceptAttr();

export {
  extensionFromFile,
  formatBytes,
  normalizeExtension,
  type ConverterCategory,
};

export function buildAppAcceptAttr(): string {
  const web = buildWebAcceptAttr();
  const video = VIDEO_EXTENSIONS.map((ext) => `.${ext}`);
  const office = [...OFFICE_EXTENSIONS].map((ext) => `.${ext}`);
  return [...new Set([web, ...video, ...office].join(',').split(','))].filter(Boolean).join(',');
}

export function getWebBatchLimitBytes(): number {
  return WEB_MAX_BATCH_BYTES;
}

export function webBatchLimitMoLabel(): number {
  return 0;
}

export function getMaxBytesForFile(file: File): number {
  const ext = extensionFromFile(file);
  const textExtensions = new Set(['md', 'html', 'htm', 'csv', 'json', 'txt']);
  if (ext && textExtensions.has(ext)) return WEB_MAX_TEXT_BYTES;
  const category = detectCategory(file);
  if (category === 'video' || category === 'office') return APP_MAX_NATIVE_FILE_BYTES;
  if (category === 'image') return APP_MAX_IMAGE_FILE_BYTES;
  return APP_MAX_NATIVE_FILE_BYTES;
}

export function detectFormatLabel(file: File): string {
  const ext = extensionFromFile(file);
  if (ext) return `.${ext === 'jpeg' ? 'jpg' : ext}`;
  return 'Non détecté';
}

export function detectFormatsLabel(files: readonly File[]): string {
  if (files.length === 0) return 'Non détecté';
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const file of files) {
    const label = detectFormatLabel(file);
    if (seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  return labels.join(', ');
}

export function detectCategory(file: File): AppConverterCategory | null {
  const ext = extensionFromFile(file);
  if (!ext) return detectWebCategory(file);
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
  if (OFFICE_EXTENSIONS.has(ext)) return 'office';
  if (APP_IMAGE_EXTENSIONS.includes(ext)) {
    const web = detectWebCategory(file);
    if (web === 'image') return 'image';
    return 'image';
  }
  return detectWebCategory(file);
}

export function isWebInputExtension(ext: string): boolean {
  const normalized = normalizeExtension(ext);
  if (!normalized) return false;
  return (
    VIDEO_EXTENSIONS.includes(normalized) ||
    OFFICE_EXTENSIONS.has(normalized) ||
    detectWebCategory(
      new File([], `file.${normalized}`, {
        type: '',
      }),
    ) !== null
  );
}

export function isAppOnlyExtension(ext: string): boolean {
  const normalized = normalizeExtension(ext);
  if (!normalized) return false;
  return VIDEO_EXTENSIONS.includes(normalized) || OFFICE_EXTENSIONS.has(normalized);
}

export function isSupportedWebFile(file: File): boolean {
  return detectCategory(file) !== null;
}
