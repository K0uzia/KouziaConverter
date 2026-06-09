#!/usr/bin/env bash
# Installe prérequis système, Rust et dépendances npm.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib.sh"

log_info "Configuration de l'application desktop Converter…"
echo ""

bash "${SCRIPT_DIR}/install-system.sh"
bash "${SCRIPT_DIR}/install-rust.sh"

cd "${APP_ROOT}"
log_info "Installation des dépendances npm (pnpm)…"
pnpm install

ensure_cargo_env
echo ""
log_ok "Setup terminé."
echo ""
log_info "Lancez l'app : make dev"
log_info "Ou UI navigateur seule : make dev-ui"
