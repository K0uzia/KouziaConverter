import type { Preset } from './types.js';

export const PRESETS: Preset[] = [
  {
    id: 'webp-80',
    label: 'WebP 80 %',
    formatId: 'webp',
    description: 'Qualité web optimisée',
  },
  {
    id: 'mp4-h264',
    label: 'MP4 H.264',
    formatId: 'mp4',
    description: 'Universel, streaming fluide',
  },
  {
    id: 'ico-windows',
    label: 'ICO Windows',
    formatId: 'ico',
    description: 'Favicons et apps Windows',
  },
  {
    id: 'icns-macos',
    label: 'ICNS macOS',
    formatId: 'icns',
    description: 'Icônes apps macOS',
  },
  {
    id: 'png-linux-icon',
    label: 'PNG 256×256 Linux',
    formatId: 'png-icon',
    description: 'Icônes apps Linux',
  },
  {
    id: 'jpeg-high',
    label: 'JPEG haute qualité',
    formatId: 'jpeg',
    description: 'Photos avec peu de perte',
  },
  {
    id: 'png-lossless',
    label: 'PNG sans perte',
    formatId: 'png',
    description: 'Graphismes et logos',
  },
];

export function getPresetById(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}

export function getPresetsForFormat(formatId: string): Preset[] {
  return PRESETS.filter((p) => p.formatId === formatId);
}
