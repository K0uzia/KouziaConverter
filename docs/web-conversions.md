# Conversions web (navigateur)

Traitement 100 % local sur `/convertir`. Limites : **24 Mo par lot** (32 Mo si le navigateur signale ≥ 8 Go de RAM), **16 Mo** par fichier image/audio/PDF, **8 Mo** par fichier texte.

## Images

Entrées web : PNG, JPEG, WebP, AVIF, GIF, SVG, BMP, TIFF, ICO, JXL, HEIC, HEIF, APNG (décodage selon le navigateur pour JXL/HEIC).

Conversion **de l'un vers l'autre** (matrice complète) + export PDF.

| Sorties image |
|---------------|
| WebP, PNG, JPEG, AVIF, GIF, SVG, BMP, TIFF, ICO, JXL, HEIC, HEIF, APNG, PDF |

HEIC/HEIF en sortie : proposés seulement si le navigateur sait les encoder (Safari principalement). SVG en sortie : vectorisation via [VTracer](https://github.com/visioncortex/vtracer) (WASM, 100 % local). Courbes lisses, transparence conservée. Un SVG qui n’embarque qu’une image PNG est re-vectorisé depuis le raster source. Les photos complexes restent une approximation. APNG : image fixe (1 frame), libellé « APNG (image fixe) » dans l’interface.

## Audio

Entrées web : WAV, MP3, OGG, Opus, M4A, AAC. Sorties : WAV, MP3, OGG (matrice complète entre ces trois formats, depuis toute entrée).

Opus, M4A et AAC ne sont pas disponibles en sortie (limitation des encodeurs navigateur). Ils se convertissent vers WAV, MP3 ou OGG.

## Documents texte

| Entrée | Sortie |
|--------|--------|
| Markdown | HTML, Texte, PDF |
| HTML | Texte, PDF |
| TXT | PDF |
| CSV | JSON |
| JSON | CSV, JSON (formaté) |

## PDF

| Sens | Détail |
|------|--------|
| Entrée | PDF avec couche texte → **TXT** (max 50 pages, pas d’OCR) |
| Sortie | Images → PDF ; MD/HTML/TXT → PDF (texte sélectionnable, paginé) |

## Réservé à l’application desktop

Vidéo, Office (DOCX, ODT…), EPUB, RTF, PDF scannés (OCR), conversions PDF avancées (Word, images de toutes les pages).

## Hors scope web

Les limites de taille protègent la mémoire de l’onglet et le stockage local (IndexedDB), pas un modèle d’abonnement.
