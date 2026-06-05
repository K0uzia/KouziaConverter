# Third-party notices

ConvertAllLocal est sous licence MIT (voir [LICENSE](LICENSE)).

## Site web (actuel)

| Dépendance | Licence | Usage |
|------------|---------|--------|
| [Astro](https://astro.build/) | MIT | Framework du site |
| [Font Awesome Free](https://fontawesome.com/) | Icons: CC BY 4.0 ; Fonts: SIL OFL 1.1 ; Code: MIT | Icônes UI (package npm, bundlé localement) |
| [VTracer](https://github.com/visioncortex/vtracer) | MIT | Vectorisation raster → SVG (via `wasm_vtracer`, WASM local) |

Les polices et CSS Font Awesome sont installées via `@fortawesome/fontawesome-free` et incluses au build (pas de chargement CDN).

## Prévu (application desktop)

Lors de l'intégration de l'application Tauri, les binaires suivants seront documentés ici avec leurs licences respectives :

- **FFmpeg** : licence selon le build embarqué (souvent LGPL/GPL ; voir la variante choisie pour les releases)
- Autres outils de conversion (images, icônes) : à compléter

Les releases GitHub incluront ce fichier à jour pour chaque version distribuée.
