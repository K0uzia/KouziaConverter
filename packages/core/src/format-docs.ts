/** Affichage doc : disponibilité site (navigateur) vs application. */

export type DocAvailability = 'yes' | 'no' | 'limited';

export interface VideoFormatDoc {
  label: string;
  mainUse: string;
  advantages: string;
  web: DocAvailability;
  app: DocAvailability;
}

export interface ImageFormatDoc {
  label: string;
  mainUse: string;
  web: DocAvailability;
  app: DocAvailability;
}

/** Vidéo : application uniquement (pas de conversion vidéo dans le navigateur). */
export const VIDEO_FORMAT_DOCS: VideoFormatDoc[] = [
  {
    label: 'MP4 (H.264)',
    mainUse: 'Web, YouTube, apps mobiles',
    advantages: 'Universel, streaming fluide',
    web: 'no',
    app: 'yes',
  },
  {
    label: 'WebM (VP9/AV1)',
    mainUse: 'Sites open-source (Chrome/Firefox)',
    advantages: 'Bande passante faible',
    web: 'no',
    app: 'yes',
  },
  {
    label: 'MOV',
    mainUse: 'iOS / macOS',
    advantages: 'Natif Apple',
    web: 'no',
    app: 'yes',
  },
  {
    label: 'MKV',
    mainUse: 'Apps multi-pistes',
    advantages: 'Sous-titres / audio flexibles',
    web: 'no',
    app: 'yes',
  },
  {
    label: 'AVI / FLV',
    mainUse: 'Anciens fichiers',
    advantages: 'Compatibilité legacy',
    web: 'no',
    app: 'yes',
  },
];

/**
 * Images et icônes.
 * Site : oui avec limite de poids (voir BROWSER_MAX_FILE_BYTES dans capabilities).
 * Pas de vidéo sur le site.
 */
export const IMAGE_FORMAT_DOCS: ImageFormatDoc[] = [
  { label: 'JPEG', mainUse: 'Photos', web: 'limited', app: 'yes' },
  { label: 'PNG', mainUse: 'Logos, graphismes, icônes', web: 'limited', app: 'yes' },
  { label: 'WebP', mainUse: 'Moderne optimisé', web: 'limited', app: 'yes' },
  { label: 'AVIF', mainUse: 'Standard moderne', web: 'limited', app: 'yes' },
  { label: 'GIF', mainUse: 'Animations courtes', web: 'limited', app: 'yes' },
  { label: 'SVG', mainUse: 'UI responsive, icônes', web: 'limited', app: 'yes' },
  { label: 'ICO', mainUse: 'Favicons, apps Windows', web: 'no', app: 'yes' },
  { label: 'ICNS', mainUse: 'Icônes apps macOS', web: 'no', app: 'yes' },
  { label: 'PNG 256×256', mainUse: 'Icônes apps Linux', web: 'no', app: 'yes' },
];

export function docAvailabilitySymbol(
  availability: DocAvailability,
  context: 'web' | 'app',
  maxFileMb?: number,
): string {
  switch (availability) {
    case 'yes':
      return '✅';
    case 'no':
      return '❌';
    case 'limited':
      if (context === 'web' && maxFileMb != null) {
        return `✅ (≤${maxFileMb} Mo)`;
      }
      return '✅ limité';
    default:
      return '❌';
  }
}
