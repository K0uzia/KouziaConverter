/** Alias d'extensions normalisées (entrée web et moteurs). */
export const EXTENSION_ALIASES: Record<string, string> = {
  jpg: 'jpeg',
  jfif: 'jpeg',
  tif: 'tiff',
  htm: 'html',
};

export function normalizeExtension(ext: string): string {
  const lower = ext.replace(/^\./, '').toLowerCase();
  return EXTENSION_ALIASES[lower] ?? lower;
}
