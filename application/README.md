# Converter (application desktop)

Interface Tauri 2 + Vite, alignée sur le convertisseur du site. Phase actuelle : **UI statique** sans moteurs de conversion.

**Icônes** : `@fortawesome/fontawesome-free` (npm), importé dans `src/styles/base/fontawesome.css`. Utiliser `<i class="fa-solid fa-…" aria-hidden="true"></i>`.

## Démarrage rapide

```bash
cd application
make setup    # une fois : apt (Linux), Rust, pnpm install
make dev      # fenêtre Tauri
```

## Commandes Make

| Commande | Description |
|----------|-------------|
| `make help` | Liste des commandes |
| `make setup` | Installe tout ce qui manque |
| `make check` | Vérifie Node 22+, pnpm, Rust, paquets apt, node_modules |
| `make dev` | Lance `pnpm tauri dev` (charge `~/.cargo/env`) |
| `make dev-ui` | UI dans le navigateur (http://localhost:1420) |
| `make build` | Build production Tauri |
| `make install-system` | Paquets apt Tauri (Debian/Ubuntu, sudo) |
| `make install-rust` | Installe Rust via rustup si absent |
| `make install-deps` | `pnpm install` uniquement |
| `make clean` | Libère l'espace (target Rust, cache Cargo, dist, pnpm) |

Équivalents npm : `pnpm setup`, `pnpm check`, `pnpm dev:app`.

## Prérequis

- Node.js 22+
- pnpm
- Rust (installé par `make setup` via rustup)
- Linux Debian/Ubuntu : paquets listés dans [Prerequisites Tauri](https://v2.tauri.app/start/prerequisites/) (installés par `make install-system`)

Après une installation manuelle de Rust, rechargez le shell : `source "$HOME/.cargo/env"` ou ouvrez un nouveau terminal. `make dev` le fait automatiquement.
