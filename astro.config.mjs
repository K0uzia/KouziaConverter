// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  vite: {
    css: {
      // Chemins webfonts Font Awesome résolus depuis node_modules au build
      devSourcemap: true,
    },
  },
});
