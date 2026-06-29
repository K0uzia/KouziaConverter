import type { APIRoute } from 'astro';
import { brandName, githubUrl, pageUrl, siteUrl } from '../data/site';

export const GET: APIRoute = () => {
  const home = new URL(pageUrl('/'), siteUrl).href;
  const convertir = new URL(pageUrl('convertir/'), siteUrl).href;
  const documentation = new URL(pageUrl('documentation/'), siteUrl).href;
  const privacy = new URL(pageUrl('confidentialite/'), siteUrl).href;
  const webConversions = new URL(pageUrl('documentation/web/conversions/'), siteUrl).href;
  const desktopApp = new URL(pageUrl('documentation/application/apercu/'), siteUrl).href;
  const webMatrix = new URL(pageUrl('docs/web-conversions.md'), siteUrl).href;

  const body = `# ${brandName}

> Convertisseur de fichiers 100 % local dans le navigateur : images, audio, documents et PDF. Gratuit, open source, sans envoi sur un serveur.

${brandName} traite les fichiers sur l'appareil de l'utilisateur. Les conversions web s'exécutent dans le navigateur via WebAssembly et les APIs du navigateur.

## Parcours principaux

- [Accueil](${home}): présentation, formats supportés, FAQ
- [Convertir](${convertir}): convertisseur web local
- [Documentation](${documentation}): guides techniques
- [Confidentialité](${privacy}): politique de confidentialité et consentement analytique

## Documentation

- [Conversions navigateur](${webConversions}): formats, limites et moteurs WASM
- [Application desktop](${desktopApp}): aperçu Tauri, vidéo et Office lourd
- [Matrice des conversions web](${webMatrix}): détail technique des formats

## Projet

- [Dépôt GitHub](${githubUrl}): code source et issues
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
