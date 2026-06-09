#!/usr/bin/env bash
# Fonctions partagées (check, setup, dev).

set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log_ok() {
  printf '  \033[32m✓\033[0m %s\n' "$1"
}

log_miss() {
  printf '  \033[33m○\033[0m %s\n' "$1"
}

log_err() {
  printf '  \033[31m✗\033[0m %s\n' "$1" >&2
}

log_info() {
  printf '→ %s\n' "$1"
}

ensure_cargo_env() {
  if [[ -f "${HOME}/.cargo/env" ]]; then
    # shellcheck disable=SC1091
    source "${HOME}/.cargo/env"
  fi
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

node_major_version() {
  node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo "0"
}

is_debian_like() {
  [[ -f /etc/debian_version ]] && command_exists apt-get
}

APT_TAURI_PACKAGES=(
  libwebkit2gtk-4.1-dev
  build-essential
  curl
  wget
  file
  libxdo-dev
  libssl-dev
  libayatana-appindicator3-dev
  librsvg2-dev
)

apt_package_installed() {
  dpkg -s "$1" >/dev/null 2>&1
}

missing_apt_packages() {
  local pkg
  for pkg in "${APT_TAURI_PACKAGES[@]}"; do
    if ! apt_package_installed "$pkg"; then
      echo "$pkg"
    fi
  done
}

check_node() {
  if ! command_exists node; then
    log_err "Node.js introuvable (22+ requis). https://nodejs.org/"
    return 1
  fi
  local major
  major="$(node_major_version)"
  if [[ "$major" -lt 22 ]]; then
    log_err "Node.js ${major} détecté, 22+ requis."
    return 1
  fi
  log_ok "Node.js $(node -v)"
  return 0
}

check_pnpm() {
  if ! command_exists pnpm; then
    log_err "pnpm introuvable. Installez-le : npm install -g pnpm ou corepack enable"
    return 1
  fi
  log_ok "pnpm $(pnpm -v)"
  return 0
}

check_rust() {
  ensure_cargo_env
  if ! command_exists rustc || ! command_exists cargo; then
    log_err "Rust / cargo introuvable. Lancez : make install-rust"
    return 1
  fi
  log_ok "Rust $(rustc --version | awk '{print $2}')"
  log_ok "Cargo $(cargo --version | awk '{print $2}')"
  return 0
}

check_system_linux() {
  if [[ "$(uname -s)" != "Linux" ]]; then
    log_ok "Système non Linux (paquets apt ignorés)"
    return 0
  fi

  if ! is_debian_like; then
    log_miss "Distribution non Debian/Ubuntu : vérifiez les deps Tauri manuellement"
    log_info "https://v2.tauri.app/start/prerequisites/"
    return 0
  fi

  local missing
  missing="$(missing_apt_packages)"
  if [[ -n "$missing" ]]; then
    log_err "Paquets système manquants (apt) :"
    while IFS= read -r pkg; do
      [[ -n "$pkg" ]] && log_err "  - $pkg"
    done <<<"$missing"
    log_info "Installez-les : make install-system"
    return 1
  fi

  log_ok "Paquets système Tauri (Debian/Ubuntu)"
  return 0
}

check_node_modules() {
  if [[ ! -d "${APP_ROOT}/node_modules" ]]; then
    log_err "node_modules absent. Lancez : make install-deps"
    return 1
  fi
  log_ok "Dépendances npm (node_modules)"
  return 0
}
