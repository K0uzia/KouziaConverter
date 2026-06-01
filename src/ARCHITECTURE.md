# Architecture front (Astro)

```
src/
├── components/          # Nom/Nom.astro + Nom/Nom.css (Header, Hero, Supports…)
├── data/                # Données partagées (formats supportés, etc.)
├── layouts/
├── pages/
└── styles/
    ├── base/
    │   ├── variables.css   # Toutes les valeurs (une seule fois)
    │   ├── reset.css
    │   └── fontawesome.css
    ├── global.css          # @import base/*
    ├── layouts/
    └── pages/
```

## Règles CSS

- **Variables** : tout est déclaré dans `styles/base/variables.css`. Les autres feuilles n'utilisent que `var()` et `calc(var(...))`.
- **Pas de nesting** CSS (CSS 3 plat).
- **Ordre des propriétés** dans chaque bloc :
  1. `position` (+ top/right/bottom/left si besoin)
  2. `display` + flex/grid (flow, align, justify)
  3. `width` / `max-width` / `min-width`
  4. `height` / `max-height` / `min-height`
  5. `margin`
  6. `padding`
  7. `border`
  8. `font-*` / `line-height`
  9. `color`
  10. `background`
  11. `transform`
  12. `animation`
  13. `transition`
  14. `overflow`
  15. `z-index`

Exemple (`--head: 64px`) :

```css
margin: calc(var(--head) / 4) calc(var(--head) / 4) calc(var(--head) / 10) calc(var(--head) / 4);
```

## Langages

HTML5 sémantique, CSS3 sans nesting, JavaScript ES6.

## Font Awesome

Package npm `@fortawesome/fontawesome-free`, importé dans `base/fontawesome.css` (bundlé, hors ligne).
