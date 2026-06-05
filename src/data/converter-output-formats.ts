import type { ConverterCategory } from './converter-types.js';
import { normalizeExtension } from './format-aliases.js';

export interface OutputFormatOption {
  id: string;
  label: string;
  mime: string;
  extension: string;
  categories: ConverterCategory[];
  /** Extensions d'entrée autorisées (sans point). Vide = toute la catégorie. */
  inputs?: string[];
}

/** Formats image web : une sortie par format (conversion de l'un vers l'autre). */
export const IMAGE_OUTPUT_FORMAT_META: Record<
  string,
  { label: string; mime: string; extension: string }
> = {
  webp: { label: 'WebP', mime: 'image/webp', extension: 'webp' },
  png: { label: 'PNG', mime: 'image/png', extension: 'png' },
  jpeg: { label: 'JPEG', mime: 'image/jpeg', extension: 'jpg' },
  avif: { label: 'AVIF', mime: 'image/avif', extension: 'avif' },
  gif: { label: 'GIF', mime: 'image/gif', extension: 'gif' },
  svg: { label: 'SVG', mime: 'image/svg+xml', extension: 'svg' },
  bmp: { label: 'BMP', mime: 'image/bmp', extension: 'bmp' },
  tiff: { label: 'TIFF', mime: 'image/tiff', extension: 'tiff' },
  ico: { label: 'ICO', mime: 'image/x-icon', extension: 'ico' },
  jxl: { label: 'JXL', mime: 'image/jxl', extension: 'jxl' },
  heic: { label: 'HEIC', mime: 'image/heic', extension: 'heic' },
  heif: { label: 'HEIF', mime: 'image/heif', extension: 'heif' },
  apng: { label: 'APNG (image fixe)', mime: 'image/apng', extension: 'apng' },
};

export const IMAGE_OUTPUT_FORMAT_IDS = [
  'webp',
  'png',
  'jpeg',
  'avif',
  'gif',
  'svg',
  'bmp',
  'tiff',
  'ico',
  'jxl',
  'heic',
  'heif',
  'apng',
] as const;

export const imageOutputFormats: OutputFormatOption[] = [
  ...IMAGE_OUTPUT_FORMAT_IDS.map((id) => ({
    id,
    categories: ['image'] as ConverterCategory[],
    ...IMAGE_OUTPUT_FORMAT_META[id],
  })),
  { id: 'pdf', label: 'PDF', mime: 'application/pdf', extension: 'pdf', categories: ['image'] },
];

export const audioOutputFormats: OutputFormatOption[] = [
  { id: 'wav', label: 'WAV', mime: 'audio/wav', extension: 'wav', categories: ['audio'] },
  { id: 'mp3', label: 'MP3', mime: 'audio/mpeg', extension: 'mp3', categories: ['audio'] },
  { id: 'ogg', label: 'OGG', mime: 'audio/ogg', extension: 'ogg', categories: ['audio'] },
];

export const documentOutputFormats: OutputFormatOption[] = [
  {
    id: 'html',
    label: 'HTML',
    mime: 'text/html',
    extension: 'html',
    categories: ['document'],
    inputs: ['md', 'pdf'],
  },
  { id: 'txt', label: 'Texte', mime: 'text/plain', extension: 'txt', categories: ['document'], inputs: ['md', 'html', 'htm', 'pdf'] },
  { id: 'json', label: 'JSON', mime: 'application/json', extension: 'json', categories: ['document'], inputs: ['csv', 'json'] },
  { id: 'csv', label: 'CSV', mime: 'text/csv', extension: 'csv', categories: ['document'], inputs: ['json'] },
  {
    id: 'pdf',
    label: 'PDF',
    mime: 'application/pdf',
    extension: 'pdf',
    categories: ['document'],
    inputs: ['md', 'html', 'htm', 'txt'],
  },
];

export const allOutputFormats: OutputFormatOption[] = [
  ...imageOutputFormats,
  ...audioOutputFormats,
  ...documentOutputFormats,
];

export const defaultOutputByCategory: Record<ConverterCategory, string> = {
  image: 'webp',
  audio: 'wav',
  document: 'html',
};

export function outputFormatById(id: string): OutputFormatOption | undefined {
  return allOutputFormats.find((f) => f.id === id);
}

export function outputFormatsForCategory(
  category: ConverterCategory,
  inputExt?: string,
): OutputFormatOption[] {
  if (category === 'image') {
    return imageOutputFormats;
  }
  const normalized = inputExt?.replace(/^\./, '').toLowerCase();
  return allOutputFormats.filter((opt) => {
    if (!opt.categories.includes(category)) return false;
    if (!opt.inputs?.length) return true;
    if (!normalized) return true;
    return opt.inputs.includes(normalized);
  });
}

/** MIME image pour une extension d'entrée web (accept, détection). */
export function imageMimeForExtension(ext: string): string | undefined {
  const normalized = normalizeExtension(ext);
  const meta = IMAGE_OUTPUT_FORMAT_META[normalized];
  return meta?.mime;
}
