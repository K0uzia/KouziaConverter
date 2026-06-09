import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { appSiteAliasesPlugin } from './vite-site-aliases.ts';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const siteSrc = path.resolve(rootDir, '../src');
/** Racine du dépôt : les imports du site résolvent @jsquash/* depuis ../node_modules. */
const workspaceRoot = path.resolve(rootDir, '..');

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// @ts-expect-error process is a nodejs global
const hostPlatform = process.env.TAURI_ENV_PLATFORM;
// @ts-expect-error process is a nodejs global
const isDebug = process.env.TAURI_ENV_DEBUG === 'true';
// Chemins WASM relatifs au chunk (Tauri + preview), pas /assets absolus.
const tauriBase = hostPlatform ? './' : '/';

// https://vite.dev/config/
export default defineConfig(async () => ({
  base: tauriBase,
  plugins: [appSiteAliasesPlugin(rootDir), wasm(), topLevelAwait()],
  define: {
    __DESKTOP_APP__: JSON.stringify(true),
  },
  resolve: {
    alias: [
      { find: '@site-styles', replacement: path.resolve(siteSrc, 'styles') },
    ],
  },
  build: {
    target: hostPlatform === 'windows' ? 'chrome105' : 'safari13',
    minify: isDebug ? false : 'esbuild',
    sourcemap: isDebug,
  },
  optimizeDeps: {
    include: ['fflate', 'marked', 'jspdf', '@breezystack/lamejs'],
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

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    fs: {
      allow: [rootDir, siteSrc, workspaceRoot],
    },
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
}));
