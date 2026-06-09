# Converter desktop (Tauri) — commandes de dev et setup
# Usage : make help

SHELL := /bin/bash
SCRIPTS := scripts

.PHONY: help check setup install-system install-rust install-deps dev dev-ui build build-linux build-windows clean disk-usage

help:
	@echo "Converter — application desktop (Tauri)"
	@echo ""
	@echo "  make setup           Installe tout (apt, Rust, pnpm install)"
	@echo "  make check           Vérifie Node, pnpm, Rust, paquets système"
	@echo "  make dev             Lance Tauri en mode dev (fenêtre native)"
	@echo "  make dev-ui          Lance Vite seul (http://localhost:1420)"
	@echo "  make build           Installateur + binaire pour l'OS courant"
	@echo "  make build-linux     Alias build (sur Linux : .deb + .AppImage)"
	@echo "  make build-windows   Rappel : le .exe Windows se build sous Windows ou via CI"
	@echo ""
	@echo "  make install-system  Paquets apt Tauri (Debian/Ubuntu, sudo)"
	@echo "  make install-rust    Rust via rustup si absent"
	@echo "  make install-deps    pnpm install uniquement"
	@echo "  make clean           Libère l'espace (Rust, caches, dist)"
	@echo "  make disk-usage      Affiche l'espace disque et les gros dossiers"

check:
	@bash $(SCRIPTS)/check-prereqs.sh

setup:
	@bash $(SCRIPTS)/setup.sh

install-system:
	@bash $(SCRIPTS)/install-system.sh

install-rust:
	@bash $(SCRIPTS)/install-rust.sh

install-deps:
	pnpm install

dev:
	@bash $(SCRIPTS)/dev.sh

dev-ui:
	pnpm dev

build build-linux:
	@bash $(SCRIPTS)/build.sh

build-windows:
	@echo "Le installateur Windows (.exe NSIS) ne se compile pas nativement depuis Linux."
	@echo "Options :"
	@echo "  1. Machine Windows : cd application && pnpm tauri build"
	@echo "  2. CI GitHub : workflow « Desktop build » (artefacts linux + windows)"

clean:
	@bash $(SCRIPTS)/clean.sh

disk-usage:
	@df -h .
	@echo ""
	@du -sh src-tauri/target ~/.cargo/registry ~/.cargo/git node_modules 2>/dev/null || true
