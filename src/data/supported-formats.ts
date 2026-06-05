import { audioFormats, audioFormatStats } from './audio-formats.js';
import { documentsFormats, documentsFormatStats } from './documents-formats.js';
import { imageFormats, imageFormatStats } from './image-formats.js';
import { videoFormats, videoFormatStats } from './video-formats.js';

export type SupportCategoryId = 'images' | 'video' | 'audio' | 'documents';

export interface SupportedFormat {
  label: string;
  web: boolean;
  app: boolean;
}

export interface SupportCategory {
  id: SupportCategoryId;
  title: string;
  icon: string;
  formats: SupportedFormat[];
  wide?: boolean;
}

const rawCategories: SupportCategory[] = [
  {
    id: 'images',
    title: 'Images',
    icon: 'fa-solid fa-image',
    wide: true,
    formats: imageFormats,
  },
  {
    id: 'video',
    title: 'Vidéo',
    icon: 'fa-solid fa-film',
    wide: true,
    formats: videoFormats,
  },
  {
    id: 'audio',
    title: 'Audio',
    icon: 'fa-solid fa-music',
    wide: true,
    formats: audioFormats,
  },
  {
    id: 'documents',
    title: 'Documents',
    icon: 'fa-solid fa-file-lines',
    wide: true,
    formats: documentsFormats,
  },
];

export const supportCategories: SupportCategory[] = rawCategories;

export { imageFormatStats, audioFormatStats, videoFormatStats, documentsFormatStats };

export function formatsForEnv(
  formats: SupportedFormat[],
  env: 'web' | 'app',
): SupportedFormat[] {
  return formats.filter((f) => (env === 'web' ? f.web : f.app));
}

/** Formats disponibles uniquement sur l'application (pas sur le web). */
export function formatsAppOnly(formats: SupportedFormat[]): SupportedFormat[] {
  return formats.filter((f) => f.app && !f.web);
}

/**
 * Colonne « Application » : formats app-only, ou les formats web si tous sont aussi sur l'app.
 */
export function formatsForAppColumn(formats: SupportedFormat[]): SupportedFormat[] {
  const appOnly = formatsAppOnly(formats);
  if (appOnly.length > 0) return appOnly;
  const web = formatsForEnv(formats, 'web');
  if (web.length > 0 && web.every((f) => f.app)) return web;
  return [];
}

/** Mêmes extensions (ordre ignoré) dans les deux listes. */
export function formatsListsIdentical(
  a: SupportedFormat[],
  b: SupportedFormat[],
): boolean {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return false;
  const labels = (list: SupportedFormat[]) =>
    list
      .map((f) => f.label)
      .sort()
      .join('\0');
  return labels(a) === labels(b);
}

/** Libellés des extensions web pour une catégorie (affichage UI). */
export function webExtensionLabels(id: SupportCategoryId): string {
  const formats = formatsForEnv(
    id === 'images'
      ? imageFormats
      : id === 'audio'
        ? audioFormats
        : id === 'documents'
          ? documentsFormats
          : videoFormats,
    'web',
  );
  return formats.map((f) => f.label.replace(/^\./, '').toUpperCase()).join(', ');
}
