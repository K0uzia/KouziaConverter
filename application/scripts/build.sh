#!/usr/bin/env bash
# Build production Tauri pour l'OS courant et affiche les artefacts générés.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib.sh"

ensure_cargo_env

APP_ROOT="${APP_ROOT:-$(cd "${SCRIPT_DIR}/.." && pwd)}"
TAURI_DIR="${APP_ROOT}/src-tauri"
BUNDLE_DIR="${TAURI_DIR}/target/release/bundle"
RELEASE_BIN="${TAURI_DIR}/target/release"

log_info "Build desktop Converter (OS : $(uname -s))…"
cd "${APP_ROOT}"
pnpm tauri build

echo ""
log_ok "Build terminé."
echo ""
echo "Artefacts (OS courant uniquement) :"
echo ""

if [[ -d "${BUNDLE_DIR}/deb" ]]; then
  echo "  Debian (.deb) :"
  ls -1 "${BUNDLE_DIR}/deb"/*.deb 2>/dev/null | sed 's/^/    /' || true
fi

if [[ -d "${BUNDLE_DIR}/appimage" ]]; then
  echo "  AppImage :"
  ls -1 "${BUNDLE_DIR}/appimage"/*.AppImage 2>/dev/null | sed 's/^/    /' || true
fi

if [[ -d "${BUNDLE_DIR}/nsis" ]]; then
  echo "  Installateur Windows (.exe NSIS) :"
  ls -1 "${BUNDLE_DIR}/nsis"/*-setup.exe 2>/dev/null | sed 's/^/    /' || true
fi

if [[ -f "${RELEASE_BIN}/converter" ]]; then
  echo "  Binaire Linux : ${RELEASE_BIN}/converter"
fi

if [[ -f "${RELEASE_BIN}/Converter.exe" ]]; then
  echo "  Exécutable Windows : ${RELEASE_BIN}/Converter.exe"
elif [[ -f "${RELEASE_BIN}/converter.exe" ]]; then
  echo "  Exécutable Windows : ${RELEASE_BIN}/converter.exe"
fi

echo ""
log_info "Windows + Linux en une commande locale : impossible (compilation native par OS)."
log_info "Utilisez la CI GitHub (workflow Desktop build) ou buildez sur chaque machine."
