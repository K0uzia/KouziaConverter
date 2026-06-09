#!/usr/bin/env bash
# Installe Rust via rustup si cargo est absent.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/lib.sh"

ensure_cargo_env

if command_exists cargo && command_exists rustc; then
  log_ok "Rust déjà installé ($(rustc --version | awk '{print $2}'))"
  exit 0
fi

if ! command_exists curl; then
  log_err "curl requis pour installer rustup."
  exit 1
fi

log_info "Installation de Rust (rustup)…"
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

ensure_cargo_env

if ! command_exists cargo; then
  log_err "Installation rustup terminée mais cargo introuvable."
  log_info "Exécutez : source \"\$HOME/.cargo/env\""
  exit 1
fi

log_ok "Rust installé ($(rustc --version | awk '{print $2}'))"
