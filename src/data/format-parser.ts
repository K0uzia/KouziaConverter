import type { SupportedFormat } from './supported-formats.js';

/** Suffixe * dans la source = application uniquement (jamais affiché sur le site). */
export function parseFormatsSource(source: string): SupportedFormat[] {
  return source
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const appOnly = token.endsWith('*');
      const ext = token.replace(/^\./, '').replace(/\*$/, '');
      return {
        label: `.${ext}`,
        web: !appOnly,
        app: true,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'en'));
}

export function formatListStats(formats: SupportedFormat[]) {
  return {
    total: formats.length,
    web: formats.filter((f) => f.web).length,
    appOnly: formats.filter((f) => !f.web).length,
  };
}
