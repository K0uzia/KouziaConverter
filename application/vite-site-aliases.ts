import path from 'node:path';
import type { Plugin } from 'vite';

const APP_MODULE_BY_BASENAME: Record<string, string> = {
  'converter-limits': 'src/data/app-converter-limits.ts',
  'converter-output-formats': 'src/data/app-converter-output-formats.ts',
  'converter-engine': 'src/converter/app-converter-engine.ts',
  'converter-storage': 'src/converter/app-converter-storage.ts',
  'converter-errors': 'src/converter/app-converter-errors.ts',
};

function moduleBasename(specifier: string): string {
  const normalized = specifier.replace(/\\/g, '/').replace(/\.js$/, '');
  const parts = normalized.split('/');
  return parts[parts.length - 1] ?? normalized;
}

/**
 * Redirige les imports `.js` du site (ex. `../../data/converter-limits.js`)
 * vers les modules desktop. Les imports `.ts` directs ne sont pas touchés
 * (évite les cycles sur converter-output-formats, etc.).
 */
export function appSiteAliasesPlugin(rootDir: string): Plugin {
  return {
    name: 'app-site-aliases',
    enforce: 'pre',
    resolveId(source) {
      if (!source.endsWith('.js')) return null;
      const appRel = APP_MODULE_BY_BASENAME[moduleBasename(source)];
      if (!appRel) return null;
      return path.resolve(rootDir, appRel);
    },
  };
}
