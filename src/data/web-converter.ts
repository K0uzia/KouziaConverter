import type { ConverterCategory } from './converter-types.js';
import { imageMimeForExtension } from './converter-output-formats.js';
import { normalizeExtension } from './format-aliases.js';
import { formatsForEnv } from './supported-formats.js';
import { audioFormats } from './audio-formats.js';
import { documentsFormats } from './documents-formats.js';
import { imageFormats } from './image-formats.js';

export type { ConverterCategory } from './converter-types.js';

const webImages = formatsForEnv(imageFormats, 'web');
const webAudio = formatsForEnv(audioFormats, 'web');
const webDocuments = formatsForEnv(documentsFormats, 'web');

export const WEB_IMAGE_EXTENSIONS = extList(webImages);
export const WEB_AUDIO_EXTENSIONS = extList(webAudio);
export const WEB_DOCUMENT_EXTENSIONS = extList(webDocuments);

const ALL_WEB_EXTENSIONS = [
  ...WEB_IMAGE_EXTENSIONS,
  ...WEB_AUDIO_EXTENSIONS,
  ...WEB_DOCUMENT_EXTENSIONS,
];

function extList(formats: { label: string }[]): string[] {
  return formats.map((f) => f.label.replace(/^\./, '').toLowerCase());
}

export { normalizeExtension } from './format-aliases.js';

export function extensionFromFile(file: File): string {
  const dot = file.name.lastIndexOf('.');
  if (dot > 0) return normalizeExtension(file.name.slice(dot + 1));
  const mime = file.type.toLowerCase();
  if (mime === 'image/jpeg' || mime === 'image/pjpeg') return 'jpeg';
  if (mime === 'image/svg+xml') return 'svg';
  if (mime === 'image/x-icon' || mime === 'image/vnd.microsoft.icon') return 'ico';
  if (mime === 'image/x-ms-bmp' || mime === 'image/bmp') return 'bmp';
  if (mime === 'image/tiff' || mime === 'image/x-tiff') return 'tiff';
  if (mime === 'image/heic' || mime === 'image/heif' || mime === 'image/heic-sequence') {
    return mime.includes('heif') ? 'heif' : 'heic';
  }
  if (mime === 'image/jxl') return 'jxl';
  if (mime === 'image/apng') return 'apng';
  if (mime.startsWith('image/')) return normalizeExtension(mime.slice(6));
  if (mime === 'audio/mpeg') return 'mp3';
  if (mime === 'audio/mp4' || mime === 'audio/x-m4a') return 'm4a';
  if (mime === 'audio/wav' || mime === 'audio/wave' || mime === 'audio/x-wav') return 'wav';
  if (mime === 'audio/ogg') return 'ogg';
  if (mime === 'audio/opus') return 'opus';
  if (mime === 'text/html') return 'html';
  if (mime === 'text/markdown') return 'md';
  if (mime === 'text/csv') return 'csv';
  if (mime === 'application/json') return 'json';
  if (mime === 'text/plain') return 'txt';
  if (mime === 'application/pdf') return 'pdf';
  return '';
}

export function detectCategory(file: File): ConverterCategory | null {
  const ext = extensionFromFile(file);
  if (!ext) return null;
  if (WEB_IMAGE_EXTENSIONS.includes(ext)) return 'image';
  if (WEB_AUDIO_EXTENSIONS.includes(ext)) return 'audio';
  if (WEB_DOCUMENT_EXTENSIONS.includes(ext)) return 'document';
  return null;
}

export function isWebExtension(ext: string): boolean {
  const normalized = normalizeExtension(ext);
  return ALL_WEB_EXTENSIONS.includes(normalized);
}

export function buildWebAcceptAttr(): string {
  const imageParts = webImages.flatMap((f) => {
    const ext = f.label.replace(/^\./, '').toLowerCase();
    const mime = imageMimeForExtension(ext);
    return mime ? [f.label, mime] : [f.label];
  });
  const parts = [
    'image/*',
    ...imageParts,
    ...webAudio.map((f) => `audio/${f.label.replace(/^\./, '')}`),
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    ...webDocuments.map((f) => f.label),
    '.txt',
    'text/plain',
    'text/html',
    'text/markdown',
    'text/csv',
    'application/json',
    'application/pdf',
    '.pdf',
  ];
  return [...new Set(parts)].join(',');
}
