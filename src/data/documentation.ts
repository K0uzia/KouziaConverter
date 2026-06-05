import { pageUrl } from './site';

export type DocCategoryId = 'web' | 'application';

export interface DocCategory {
  id: DocCategoryId;
  title: string;
  description: string;
  icon: string;
}

export interface DocArticle {
  slug: string;
  category: DocCategoryId;
  title: string;
  description: string;
  href: string;
  updated: string;
}

export const docCategories: DocCategory[] = [
  {
    id: 'web',
    title: 'Web',
    description: 'Convertisseur navigateur sur /convertir : traitement local, limites et matrices de conversion.',
    icon: 'fa-solid fa-globe',
  },
  {
    id: 'application',
    title: 'Application',
    description: 'Application desktop Tauri (à venir) : vidéo, Office, OCR et fichiers plus volumineux.',
    icon: 'fa-solid fa-desktop',
  },
];

export const docArticles: DocArticle[] = [
  {
    slug: 'conversions',
    category: 'web',
    title: 'Conversions navigateur',
    description:
      'Formats pris en charge, limites de taille, matrices image/audio/document/PDF et cas particuliers (HEIC, SVG, APNG).',
    href: pageUrl('documentation/web/conversions/'),
    updated: '2026-06-05',
  },
  {
    slug: 'apercu',
    category: 'application',
    title: 'Application desktop',
    description:
      'Périmètre prévu pour l\'application locale : vidéo, Office, OCR, RAW et conversions PDF avancées.',
    href: pageUrl('documentation/application/apercu/'),
    updated: '2026-06-05',
  },
];

export function articlesForCategory(categoryId: DocCategoryId): DocArticle[] {
  return docArticles.filter((a) => a.category === categoryId);
}

export function categoryById(id: DocCategoryId): DocCategory | undefined {
  return docCategories.find((c) => c.id === id);
}
