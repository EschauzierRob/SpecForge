# Bootstrapped Local CLI Tooling

## ID
F-0022

## Type
Feature

## Parent
E-0002

## Summary
Bootstrap connected repositories with local, Codex-detectable SpecForge CLI tooling.

## Problem / Context
Repositories that have SpecForge specs and workflow instructions can still lack a local SpecForge CLI, which prevents AI integrations from reliably invoking parse, compose, and validate checks.

## Goals
- Seed local SpecForge CLI launchers and runtime artifacts during workspace bootstrap.
- Report local CLI tooling availability through discovery results.
- Keep the toolchain repository-local and idempotent.

## Non-goals
- Publishing SpecForge to a package registry as part of bootstrap.
- Overwriting user-managed tooling files.
- Requiring target repositories to use npm.

## Requirements
- [ ] R1: Bootstrap creates local SpecForge CLI launchers and runtime artifacts when missing.
- [ ] R2: Discovery reports whether local CLI tooling is available, missing, or partial.
- [ ] R3: Bootstrapped CLI tooling supports parse, compose, ingest, and validate commands.
- [ ] R4: Node repositories receive safe npm script aliases only when no script conflict exists.

## Acceptance Criteria
- [ ] AC1: A partially initialized repository becomes runnable through `specforge/bin/specforge`.
- [ ] AC2: Repeated discovery does not rewrite existing CLI tooling files.
- [ ] AC3: Discovery output exposes launcher paths, runtime path, manifest path, and version.
- [ ] AC4: Package scripts are additive and preserve existing conflicting script names.

## Dependencies
- F-0014
- F-0005
- F-0006
- F-0010

## Open Questions
- Should future upgrades verify tool artifact hashes before replacing stale runtimes?

## Notes
This feature extends workspace bootstrap from metadata readiness to toolchain readiness.
