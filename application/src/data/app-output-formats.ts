export type AppSettingsCategory = 'image' | 'audio' | 'document' | 'video' | 'office';

export interface AppFormatOption {
  id: string;
  label: string;
}

export const APP_DEFAULT_OUTPUT: Record<AppSettingsCategory, string> = {
  image: 'webp',
  audio: 'wav',
  document: 'html',
  video: 'mp4',
  office: 'pdf',
};

export const appOutputFormats: Record<AppSettingsCategory, AppFormatOption[]> = {
  image: [
    { id: 'webp', label: 'WebP' },
    { id: 'png', label: 'PNG' },
    { id: 'jpeg', label: 'JPEG' },
    { id: 'avif', label: 'AVIF' },
    { id: 'gif', label: 'GIF' },
    { id: 'svg', label: 'SVG' },
    { id: 'bmp', label: 'BMP' },
    { id: 'tiff', label: 'TIFF' },
    { id: 'ico', label: 'ICO' },
    { id: 'jxl', label: 'JXL' },
    { id: 'heic', label: 'HEIC' },
    { id: 'heif', label: 'HEIF' },
    { id: 'apng', label: 'APNG (image fixe)' },
    { id: 'pdf', label: 'PDF' },
  ],
  audio: [
    { id: 'wav', label: 'WAV' },
    { id: 'mp3', label: 'MP3' },
    { id: 'ogg', label: 'OGG' },
  ],
  document: [
    { id: 'html', label: 'HTML' },
    { id: 'txt', label: 'Texte' },
    { id: 'json', label: 'JSON' },
    { id: 'csv', label: 'CSV' },
    { id: 'pdf', label: 'PDF' },
  ],
  video: [
    { id: 'mp4', label: 'MP4' },
    { id: 'mkv', label: 'MKV' },
    { id: 'webm', label: 'WebM' },
    { id: 'mov', label: 'MOV' },
    { id: 'avi', label: 'AVI' },
    { id: 'wmv', label: 'WMV' },
  ],
  office: [
    { id: 'pdf', label: 'PDF' },
    { id: 'docx', label: 'DOCX' },
    { id: 'odt', label: 'ODT' },
    { id: 'xlsx', label: 'XLSX' },
    { id: 'txt', label: 'Texte' },
  ],
};

const SETTINGS_OUTPUT_ARIA: Record<AppSettingsCategory, string> = {
  image: 'Format de sortie par défaut pour les images',
  audio: 'Format de sortie par défaut pour l\'audio',
  document: 'Format de sortie par défaut pour les documents',
  video: 'Format de sortie par défaut pour la vidéo',
  office: 'Format de sortie par défaut pour Office et formats pro',
};

const SETTINGS_OUTPUT_LIST_ARIA: Record<AppSettingsCategory, string> = {
  image: 'Formats de sortie image par défaut',
  audio: 'Formats de sortie audio par défaut',
  document: 'Formats de sortie document par défaut',
  video: 'Formats de sortie vidéo par défaut',
  office: 'Formats de sortie Office par défaut',
};

export function outputOptionsForCategory(category: AppSettingsCategory): AppFormatOption[] {
  return appOutputFormats[category];
}

export function formatLabelForId(category: AppSettingsCategory, id: string): string | undefined {
  return appOutputFormats[category].find((opt) => opt.id === id)?.label;
}

export function isValidOutputId(category: AppSettingsCategory, id: string): boolean {
  return appOutputFormats[category].some((opt) => opt.id === id);
}

export function settingsOutputAria(category: AppSettingsCategory): string {
  return SETTINGS_OUTPUT_ARIA[category];
}

export function settingsOutputListAria(category: AppSettingsCategory): string {
  return SETTINGS_OUTPUT_LIST_ARIA[category];
}

export const APP_SETTINGS_CATEGORIES: AppSettingsCategory[] = [
  'image',
  'audio',
  'document',
  'video',
  'office',
];
