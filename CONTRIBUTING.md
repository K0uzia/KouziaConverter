# Contribuer à ConvertAllLocal

Merci de votre intérêt pour ce projet gratuit et open source (MIT).

## Installation locale

Guide complet (clone, prérequis, pnpm, lancement) : section **Installation en mode développement (local)** du [Readme.md](./Readme.md).

Résumé après clone :

```bash
pnpm install
pnpm dev
```

Si `pnpm` est introuvable : voir le Readme (étape 3) ou `npm run dev:npx`.

## Structure du projet

Voir [src/ARCHITECTURE.md](./src/ARCHITECTURE.md).

```
src/
  components/     # Un dossier par composant (.astro + .css)
  layouts/
  pages/
  styles/         # global, tokens, fontawesome, pages/*.css
public/
```

## Périmètre actuel

- Site Astro, composants modulaires, Font Awesome local (npm)
- UI convertisseur et moteurs de conversion : à développer
- Application desktop Tauri : phase suivante

## Conventions

- Français pour l'UI et la doc utilisateur en phase 1
- Pas de modèle « essai » ou freemium : limites web = contraintes navigateur
- Pas de tiret cadratin (`—`) : voir `.cursor/rules/no-em-dash.mdc`
- Icônes : `<Icon icon="fa-solid fa-…" />`, pas de CDN Font Awesome
- PRs focalisées, messages de commit clairs
