// @ts-check
import { defineConfig } from 'astro/config';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://astro.build/config
export default defineConfig({
  // Barre Astro en bas du navigateur : 504 "Outdated Optimize Dep" si Vite re-optimise
  // après le premier chargement de /convertir (jspdf, lamejs, etc.). Pas la toolbar du convertisseur.
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [wasm(), topLevelAwait()],
    // Cache dédié (évite les conflits si plusieurs projets Vite tournent en parallèle)
    cacheDir: 'node_modules/.vite-convertalllocal',
    css: {
      // Chemins webfonts Font Awesome résolus depuis node_modules au build
      devSourcemap: true,
    },
    optimizeDeps: {
      // Pré-bundler au démarrage pour éviter une re-optimisation tardive (→ 504 dev-toolbar)
      include: ['fflate', 'marked', 'jspdf', '@breezystack/lamejs'],
      // pdfjs-dist / WASM : pré-bundle Vite casse le worker (échec PDF → texte en dev)
      exclude: [
        '@jsquash/png',
        '@jsquash/jpeg',
        '@jsquash/webp',
        '@jsquash/avif',
        '@jsquash/jxl',
        'pdfjs-dist',
        'wasm-media-encoders',
        'wasm_vtracer',
        '@wasm-audio-decoders/ogg-vorbis',
        'ogg-opus-decoder',
      ],
    },
    worker: {
      format: 'es',
    },
  },
});
