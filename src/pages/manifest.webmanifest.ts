import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const base = import.meta.env.BASE_URL;
  const manifest = {
    name: 'Convert All Local',
    short_name: 'ConvertAllLocal',
    description: 'Conversion de fichiers 100 % locale dans le navigateur.',
    start_url: base,
    display: 'standalone',
    background_color: '#15182e',
    theme_color: '#15182e',
    icons: [
      {
        src: `${base}favicon/favicon.svg`,
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
