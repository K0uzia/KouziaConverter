#!/usr/bin/env bash
# Installe les paquets apt requis par Tauri sur Debian/Ubuntu.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib.sh"

if [[ "$(uname -s)" != "Linux" ]]; then
  log_info "Hors Linux : rien à installer via apt."
  exit 0
fi

if ! is_debian_like; then
  log_info "Distribution non Debian/Ubuntu."
  log_info "Consultez https://v2.tauri.app/start/prerequisites/"
  exit 0
fi

missing="$(missing_apt_packages)"
if [[ -z "$missing" ]]; then
  log_ok "Paquets système Tauri déjà installés"
  exit 0
fi

log_info "Paquets à installer :"
while IFS= read -r pkg; do
  [[ -n "$pkg" ]] && printf '  - %s\n' "$pkg"
done <<<"$missing"

if ! command_exists sudo; then
  log_err "sudo introuvable. Installez les paquets manuellement avec apt."
  exit 1
fi

log_info "Mise à jour de l'index apt…"
sudo apt-get update -qq

# shellcheck disable=SC2046
sudo apt-get install -y $(echo "$missing" | tr '\n' ' ')

log_ok "Paquets système installés"
