import type { OutputFormat } from './types.js';

export const OUTPUT_FORMATS: OutputFormat[] = [
  { id: 'jpeg', label: 'JPEG', kind: 'image', extension: 'jpg', description: 'Photos' },
  { id: 'png', label: 'PNG', kind: 'image', extension: 'png', description: 'Logos, graphismes' },
  { id: 'webp', label: 'WebP', kind: 'image', extension: 'webp', description: 'Moderne optimisé' },
  { id: 'avif', label: 'AVIF', kind: 'image', extension: 'avif', description: 'Standard moderne' },
  { id: 'gif', label: 'GIF', kind: 'image', extension: 'gif', description: 'Animations courtes' },
  { id: 'svg', label: 'SVG', kind: 'image', extension: 'svg', description: 'UI responsive, icônes' },
  { id: 'mp4', label: 'MP4 (H.264)', kind: 'video', extension: 'mp4', description: 'Web, apps mobiles' },
  { id: 'webm', label: 'WebM (VP9/AV1)', kind: 'video', extension: 'webm', description: 'Chrome, Firefox' },
  { id: 'mov', label: 'MOV', kind: 'video', extension: 'mov', description: 'iOS / macOS' },
  { id: 'mkv', label: 'MKV', kind: 'video', extension: 'mkv', description: 'Multi-pistes' },
  { id: 'avi', label: 'AVI', kind: 'video', extension: 'avi', description: 'Compatibilité legacy' },
  { id: 'ico', label: 'ICO', kind: 'icon', extension: 'ico', description: 'Favicons, apps Windows' },
  { id: 'icns', label: 'ICNS', kind: 'icon', extension: 'icns', description: 'Icônes apps macOS' },
  {
    id: 'png-icon',
    label: 'PNG 256×256',
    kind: 'icon',
    extension: 'png',
    description: 'Icônes apps Linux',
  },
];

export function getFormatById(id: string): OutputFormat | undefined {
  return OUTPUT_FORMATS.find((f) => f.id === id);
}
