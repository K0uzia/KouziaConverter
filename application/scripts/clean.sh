#!/usr/bin/env bash
# Nettoie builds Rust, cache Cargo, dist Vite et store pnpm inutilisé.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TAURI_DIR="${APP_ROOT}/src-tauri"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib.sh"

dir_size_kb() {
  if [[ -d "$1" ]]; then
    du -sk "$1" 2>/dev/null | awk '{print $1}'
  else
    echo 0
  fi
}

total_before=0
total_after=0

measure() {
  local path="$1"
  total_before=$((total_before + $(dir_size_kb "$path")))
}

measure_after() {
  local path="$1"
  total_after=$((total_after + $(dir_size_kb "$path")))
}

log_info "Nettoyage Converter (Rust, caches, dist)…"
echo ""

measure "${TAURI_DIR}/target"
measure "${HOME}/.cargo/registry/cache"
measure "${APP_ROOT}/dist"
measure "${APP_ROOT}/node_modules/.vite"

ensure_cargo_env

if command_exists cargo && [[ -d "${TAURI_DIR}" ]]; then
  log_info "cargo clean (src-tauri/target/)…"
  (cd "${TAURI_DIR}" && cargo clean 2>/dev/null) || rm -rf "${TAURI_DIR}/target"
elif [[ -d "${TAURI_DIR}/target" ]]; then
  log_info "Suppression de src-tauri/target/…"
  rm -rf "${TAURI_DIR}/target"
fi

if [[ -d "${HOME}/.cargo/registry/cache" ]]; then
  log_info "Cache Cargo (registry/cache)…"
  rm -rf "${HOME}/.cargo/registry/cache"
fi

if [[ -d "${APP_ROOT}/dist" ]]; then
  log_info "Build Vite (dist/)…"
  rm -rf "${APP_ROOT}/dist"
fi

if [[ -d "${APP_ROOT}/node_modules/.vite" ]]; then
  log_info "Cache Vite local…"
  rm -rf "${APP_ROOT}/node_modules/.vite"
fi

if command_exists pnpm; then
  log_info "Store pnpm (paquets inutilisés)…"
  pnpm store prune >/dev/null 2>&1 || true
fi

measure_after "${TAURI_DIR}/target"
measure_after "${HOME}/.cargo/registry/cache"
measure_after "${APP_ROOT}/dist"
measure_after "${APP_ROOT}/node_modules/.vite"

freed_kb=$((total_before - total_after))
if [[ "$freed_kb" -gt 1024 ]]; then
  log_ok "Environ $((freed_kb / 1024)) Mo libérés"
else
  log_ok "Nettoyage terminé"
fi

echo ""
df -h "${APP_ROOT}" | tail -1 | awk '{printf "→ Espace disque : %s libres sur %s (%s utilisé)\n", $4, $2, $5}'
echo ""
log_info "Relance : make dev"
