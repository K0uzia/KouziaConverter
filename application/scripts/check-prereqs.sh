#!/usr/bin/env bash
# Vérifie Node, pnpm, Rust, paquets système et node_modules.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib.sh"

QUIET=0
if [[ "${1:-}" == "--quiet" ]]; then
  QUIET=1
fi

say() {
  if [[ "$QUIET" -eq 0 ]]; then
    printf '%s\n' "$1"
  fi
}

fail=0

say "Vérification des prérequis Converter (Tauri)…"

check_node || fail=1
check_pnpm || fail=1
check_rust || fail=1
check_system_linux || fail=1
check_node_modules || fail=1

if [[ "$fail" -eq 0 ]]; then
  say ""
  log_ok "Tout est prêt."
  exit 0
fi

say ""
log_err "Prérequis incomplets. Corrigez puis relancez make check, ou make setup."
exit 1
