# Contribuer à ConvertAllLocal

Merci de votre intérêt pour ce projet gratuit et open source (MIT).

## Installation locale

Guide complet (clone, prérequis, pnpm, lancement) : section **Installation en mode développement (local)** du [Readme.md](./Readme.md).

Résumé après clone :

```bash
pnpm install
pnpm dev
```

Si `pnpm` est introuvable : voir le Readme (étape 3) ou `npm run setup:npx` puis `npm run dev:npx`.

## Structure du monorepo

```
apps/website/          # Site Astro (vitrine + convertisseur navigateur)
packages/core/         # Types, formats, presets (données)
packages/capabilities/ # Matrice navigateur / desktop
packages/ui/           # Composants Svelte partagés
```

## Périmètre actuel

- Interface web et fondations (`core`, `capabilities`, `ui`)
- Moteurs de conversion : non implémentés
- Application desktop Tauri : phase suivante

## Conventions

- Français pour l’UI et la doc utilisateur en phase 1
- Pas de modèle « essai » ou freemium : limites web = contraintes navigateur
- Pas de tiret cadratin (`—`) : voir `.cursor/rules/no-em-dash.mdc`
- PRs focalisées, messages de commit clairs
