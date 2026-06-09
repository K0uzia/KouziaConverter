#!/usr/bin/env bash
# Lance Tauri en mode dev (charge cargo env, vérifie les prérequis).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib.sh"

ensure_cargo_env

if ! bash "${SCRIPT_DIR}/check-prereqs.sh" --quiet 2>/dev/null; then
  log_err "Prérequis incomplets."
  bash "${SCRIPT_DIR}/check-prereqs.sh" || true
  echo ""
  log_info "Correction automatique : make setup"
  exit 1
fi

cd "${APP_ROOT}"
exec pnpm tauri dev
