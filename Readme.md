[![Licence MIT](https://img.shields.io/github/license/K0uzia/ConvertAllLocal)](./LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-Oui-2ea043)](https://github.com/K0uzia/ConvertAllLocal)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.12-339933?logo=node.js&logoColor=white)](./package.json)
[![pnpm](https://img.shields.io/badge/pnpm-10+-F69220?logo=pnpm&logoColor=white)](./pnpm-workspace.yaml)
[![100 % local](https://img.shields.io/badge/Traitement-100%25%20local-0ea5e9)](./Readme.md)
[![Stack](https://img.shields.io/badge/Stack-Astro%20%7C%20Svelte-BC52EE?logo=astro&logoColor=white)](./apps/website/)
[![Desktop](https://img.shields.io/badge/Desktop-Linux%20%7C%20Windows-1793D2?logo=linux&logoColor=white)](./Readme.md#formats-convertibles)

# ConvertAllLocal - FR

[EN_Readme.md](./EN_Readme.md)

ConvertAllLocal est un outil **gratuit et open source** (MIT) de conversion locale pour les formats vidéo, image et icônes les plus utilisés sur le web et en développement d'applications, **sans envoi de fichiers vers un serveur**.

## Même service, deux environnements

| | **Site (navigateur)** | **Application (à venir)** |
|---|------------------------|---------------------------|
| Accès | [Convertir en ligne](/convert) sur le site | Téléchargement (Tauri, Linux/Windows) |
| Données | Restent dans le navigateur | Restent sur votre machine |
| Limites | Images uniquement, ≤ 12 Mo par fichier | Vidéo, batch, icônes, gros fichiers |

Les limites sur le web ne sont **pas** une version d'essai ou un modèle payant : c'est le **même outil**, avec les contraintes techniques du navigateur.

## État du projet

- **Fait** : monorepo, site Astro, UI convertisseur (Svelte), packages `core` / `capabilities` / `ui`
- **En cours** : moteurs de conversion (FFmpeg, images, icônes)
- **Prévu** : application desktop Tauri 2 (léger, sans Electron)

## Installation en mode développement (local)

Guide pour cloner le dépôt, installer les outils requis et lancer le site en local.

### 1. Prérequis

| Outil | Version | Vérification |
|-------|---------|--------------|
| [Git](https://git-scm.com/) | récent | `git --version` |
| [Node.js](https://nodejs.org/) | ≥ 22.12 | `node -v` |
| [pnpm](https://pnpm.io/installation) | 10.x | `pnpm -v` |

`npm` est inclus avec Node.js. **pnpm** est obligatoire pour ce monorepo (fichier `pnpm-workspace.yaml`).

### 2. Cloner le dépôt

```bash
git clone https://github.com/K0uzia/ConvertAllLocal.git
cd ConvertAllLocal
```

Fork ou branche personnelle : adaptez l’URL de `git clone`.

### 3. Installer pnpm (si la commande est introuvable)

```bash
node -v    # doit afficher v22.12 ou plus
pnpm -v    # si « commande introuvable », continuer ci-dessous
```

**Linux / macOS (avec sudo)** :

Via npm (si Node.js est déjà installé) :

```bash
sudo npm install -g pnpm@10.12.1
pnpm -v
```

Via le script officiel (télécharge et installe pnpm) :

```bash
curl -fsSL https://get.pnpm.io/install.sh | sudo sh -
source ~/.bashrc   # ou rouvrir le terminal
pnpm -v
```

**Windows (PowerShell)** :

```powershell
npm install -g pnpm@10.12.1
pnpm -v
```

Autres méthodes : [documentation officielle pnpm](https://pnpm.io/installation).

**Alternative sans installation globale** : utiliser les scripts `npm run *:npx` à l’étape 4 (pnpm est invoqué via `npx`).

### 4. Installer les dépendances du projet

À la racine du dépôt cloné :

```bash
pnpm install
```

Sans pnpm dans le PATH :

```bash
npm run setup:npx
```

### 5. Lancer le site en développement

```bash
pnpm dev
```

Sans pnpm global :

```bash
npm run dev:npx
```

Ouvrir [http://localhost:4321](http://localhost:4321) (port par défaut d’Astro). Pages utiles : `/`, `/convert`, `/formats`.

### 6. Autres commandes utiles

```bash
pnpm build          # build de production (sortie dans apps/website/dist/)
pnpm check          # vérification TypeScript / Svelte sur tout le monorepo
pnpm --filter @convertalllocal/website preview   # prévisualiser le build (après pnpm build)
```

Équivalents sans pnpm global : `npm run build:npx`, `npm run check:npx`.

### Dépannage

- **`pnpm: command not found`** : refaire l’étape 3 ou utiliser `npm run …:npx`.
- **Version Node trop ancienne** : installer Node 22 LTS ([nvm](https://github.com/nvm-sh/nvm) ou installeur officiel).
- **Erreurs après un pull** : `pnpm install` pour resynchroniser le lockfile.

Pour contribuer (conventions, structure) : [CONTRIBUTING.md](./CONTRIBUTING.md).

## Architecture

```
apps/website/              # Astro, vitrine + /convert
packages/core/             # Formats, presets, types
packages/capabilities/     # Matrice navigateur / desktop
packages/ui/               # Composants Svelte partagés
```

## Fonctionnalités (vision)

- **Conversion 100 % locale** : FFmpeg (vidéo), outils images/icônes (à intégrer)
- **Interface** : drag & drop, presets, file d'attente
- **Batch** : application desktop
- **Offline** : après installation de l'app

## Formats convertibles

**Site (navigateur)** : images seulement, **12 Mo max** par fichier, traitement local sans upload.  
**Application** : vidéo, images, icônes, sans limite navigateur (moteurs à intégrer).

Tableau détaillé aussi sur la page **[Formats](/formats)** du site.

### Vidéo

| Format | Usage principal | Avantages | Site (navigateur) | Application |
|--------|-----------------|-----------|-------------------|-------------|
| MP4 (H.264) | Web, YouTube, apps mobiles | Universel, streaming fluide | ❌ | ✅ |
| WebM (VP9/AV1) | Sites open-source (Chrome/Firefox) | Bande passante faible | ❌ | ✅ |
| MOV | iOS / macOS | Natif Apple | ❌ | ✅ |
| MKV | Apps multi-pistes | Sous-titres / audio flexibles | ❌ | ✅ |
| AVI / FLV | Anciens fichiers | Compatibilité legacy | ❌ | ✅ |

### Images et icônes

| Format | Usage principal | Site (navigateur) | Application |
|--------|-------------------|-------------------|-------------|
| **JPEG** | Photos | ✅ (≤12 Mo) | ✅ |
| **PNG** | Logos, graphismes, icônes | ✅ (≤12 Mo) | ✅ |
| **WebP** | Moderne optimisé | ✅ (≤12 Mo) | ✅ |
| **AVIF** | Standard moderne | ✅ (≤12 Mo) | ✅ |
| **GIF** | Animations courtes | ✅ (≤12 Mo) | ✅ |
| **SVG** | UI responsive, icônes | ✅ (≤12 Mo) | ✅ |
| **ICO** | Favicons, apps Windows | ❌ | ✅ |
| **ICNS** | Icônes apps macOS | ❌ | ✅ |
| **PNG 256×256** | Icônes apps Linux | ❌ | ✅ |

**Présets suggérés** : WebP 80 %, MP4 H.264, ICO (Windows), ICNS (macOS), PNG 256×256 (Linux).

## Licence

MIT. Voir [LICENSE](./LICENSE). Dépendances tierces futures : [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
