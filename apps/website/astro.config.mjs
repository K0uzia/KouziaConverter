// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://convertalllocal.example.com',
  integrations: [svelte(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@convertalllocal/ui', '@convertalllocal/core', '@convertalllocal/capabilities'],
    },
  },
});
