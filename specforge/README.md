# SpecForge Internal Workspace

This directory contains SpecForge-specific metadata, adapter contracts, and generated read-model placeholders.

## Layout

- `ai-coder-instructions.md` defines AI-facing workflow rules for keeping specs and overlay metadata aligned.

- `overlay/` — planning metadata files and schema examples
- `indexes/` — placeholder for generated indexes/caches (implementation phase)
- `adapters/` — adapter contracts and ecosystem integration notes

## Design Principle

Everything here composes with `/specs` and does not redefine source-of-truth product intent.

Execution slices live in version `0.2` overlays and remain cross-cutting operational entities rather than canonical hierarchy nodes.

AI-assisted implementation should read `ai-coder-instructions.md` before changing specs, code, tests, or overlay metadata.
