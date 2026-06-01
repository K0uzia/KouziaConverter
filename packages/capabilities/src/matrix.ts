import type { FormatCapability } from './types.js';

/** Taille max provisoire (contrainte mémoire navigateur, ajustable). */
export const BROWSER_MAX_FILE_BYTES = 12 * 1024 * 1024; // 12 Mo

export const FORMAT_CAPABILITIES: FormatCapability[] = [
  { formatId: 'jpeg', browser: 'limited', desktop: 'full', limitReason: 'browser_memory' },
  { formatId: 'png', browser: 'limited', desktop: 'full', limitReason: 'browser_memory' },
  { formatId: 'webp', browser: 'limited', desktop: 'full', limitReason: 'browser_memory' },
  { formatId: 'avif', browser: 'limited', desktop: 'full', limitReason: 'browser_memory' },
  { formatId: 'gif', browser: 'limited', desktop: 'full', limitReason: 'browser_memory' },
  { formatId: 'svg', browser: 'limited', desktop: 'full', limitReason: 'no_codec' },
  { formatId: 'mp4', browser: 'unsupported', desktop: 'full', limitReason: 'desktop_only' },
  { formatId: 'webm', browser: 'unsupported', desktop: 'full', limitReason: 'desktop_only' },
  { formatId: 'mov', browser: 'unsupported', desktop: 'full', limitReason: 'desktop_only' },
  { formatId: 'mkv', browser: 'unsupported', desktop: 'full', limitReason: 'desktop_only' },
  { formatId: 'avi', browser: 'unsupported', desktop: 'full', limitReason: 'desktop_only' },
  { formatId: 'ico', browser: 'unsupported', desktop: 'full', limitReason: 'desktop_only' },
  { formatId: 'icns', browser: 'unsupported', desktop: 'full', limitReason: 'desktop_only' },
  { formatId: 'png-icon', browser: 'unsupported', desktop: 'full', limitReason: 'desktop_only' },
];
