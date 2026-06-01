[![MIT License](https://img.shields.io/github/license/K0uzia/ConvertAllLocal)](./LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-2ea043)](https://github.com/K0uzia/ConvertAllLocal)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.12-339933?logo=node.js&logoColor=white)](./package.json)
[![pnpm](https://img.shields.io/badge/pnpm-10+-F69220?logo=pnpm&logoColor=white)](./pnpm-workspace.yaml)
[![100% local](https://img.shields.io/badge/Processing-100%25%20local-0ea5e9)](./EN_Readme.md)
[![Stack](https://img.shields.io/badge/Stack-Astro%20%7C%20Svelte-BC52EE?logo=astro&logoColor=white)](./apps/website/)
[![Desktop](https://img.shields.io/badge/Desktop-Linux%20%7C%20Windows-1793D2?logo=linux&logoColor=white)](./EN_Readme.md#supported-formats)

# ConvertAllLocal - EN

[FR_Readme.md](./Readme.md)

ConvertAllLocal is a **free and open source** (MIT) local conversion tool for the most common video, image, and icon formats in web and app development, **with no files sent to a server**.

## Same service, two environments

| | **Website (browser)** | **Desktop app (coming)** |
|---|------------------------|--------------------------|
| Access | Convert online on the site | Download (Tauri, Linux/Windows) |
| Data | Stays in your browser | Stays on your machine |
| Limits | Images only, ≤ 12 MB per file | Video, batch, icons, large files |

Web limits are **not** a trial or paywall: **same tool**, browser technical constraints.

## Supported formats

**Website (browser)** : images only, **12 MB max** per file, local processing, no upload.  
**Desktop app** : video, images, icons, no browser size cap (engines coming soon).

See the **[Formats](/formats)** page on the site for the full table.

### Video

| Format | Main use | Advantages | Website (browser) | Desktop app |
|--------|----------|------------|-------------------|-------------|
| MP4 (H.264) | Web, YouTube, mobile apps | Universal, smooth streaming | ❌ | ✅ |
| WebM (VP9/AV1) | Open-source sites (Chrome/Firefox) | Low bandwidth | ❌ | ✅ |
| MOV | iOS / macOS | Native Apple | ❌ | ✅ |
| MKV | Multi-track apps | Flexible subtitles/audio | ❌ | ✅ |
| AVI / FLV | Legacy files | Backward compatibility | ❌ | ✅ |

### Images and icons

| Format | Main use | Website (browser) | Desktop app |
|--------|----------|-------------------|-------------|
| **JPEG** | Photos | ✅ (≤12 MB) | ✅ |
| **PNG** | Logos, graphics, icons | ✅ (≤12 MB) | ✅ |
| **WebP** | Modern optimized | ✅ (≤12 MB) | ✅ |
| **AVIF** | Modern standard | ✅ (≤12 MB) | ✅ |
| **GIF** | Short animations | ✅ (≤12 MB) | ✅ |
| **SVG** | Responsive UI, icons | ✅ (≤12 MB) | ✅ |
| **ICO** | Favicons, Windows apps | ❌ | ✅ |
| **ICNS** | macOS app icons | ❌ | ✅ |
| **PNG 256×256** | Linux app icons | ❌ | ✅ |

**Suggested presets**: WebP 80%, MP4 H.264, ICO (Windows), ICNS (macOS), PNG 256×256 (Linux).

## Local development setup

### 1. Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| [Git](https://git-scm.com/) | recent | `git --version` |
| [Node.js](https://nodejs.org/) | ≥ 22.12 | `node -v` |
| [pnpm](https://pnpm.io/installation) | 10.x | `pnpm -v` |

`npm` ships with Node.js. **pnpm** is required for this monorepo (`pnpm-workspace.yaml`).

### 2. Clone the repository

```bash
git clone https://github.com/K0uzia/ConvertAllLocal.git
cd ConvertAllLocal
```

### 3. Install pnpm (if not found)

```bash
node -v
pnpm -v
```

**Linux / macOS (with sudo)**:

Using npm (Node.js already installed):

```bash
sudo npm install -g pnpm@10.12.1
pnpm -v
```

Using the official install script (downloads and installs pnpm):

```bash
curl -fsSL https://get.pnpm.io/install.sh | sudo sh -
source ~/.bashrc   # or open a new terminal
pnpm -v
```

**Windows (PowerShell)**:

```powershell
npm install -g pnpm@10.12.1
pnpm -v
```

**Without a global install**: use `npm run *:npx` in step 4.

### 4. Install project dependencies

```bash
pnpm install
# or: npm run setup:npx
```

### 5. Start the dev server

```bash
pnpm dev
# or: npm run dev:npx
```

Open [http://localhost:4321](http://localhost:4321).

### 6. Other commands

```bash
pnpm build
pnpm check
# or: npm run build:npx / npm run check:npx
```

Troubleshooting and contributor notes: [CONTRIBUTING.md](./CONTRIBUTING.md). Full French guide: [Readme.md](./Readme.md#installation-en-mode-développement-local).

## Licence

MIT. See [LICENSE](./LICENSE). Third-party notices: [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
