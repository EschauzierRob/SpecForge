# Bootstrap Local CLI Tooling

## ID
S-0411

## Type
Story

## Parent
F-0022

## Summary
As an AI-assisted developer, I can rely on connected repositories having a local SpecForge CLI.

## Problem / Context
AI integrations need a stable local command surface for SpecForge checks, even in repositories that do not contain SpecForge source code.

## Goals
- Provide repository-local SpecForge commands after bootstrap.
- Make CLI tooling easy for Codex and humans to discover.
- Preserve existing project tooling and instructions.

## Non-goals
- Automatic network installation.
- Tool artifact upgrades without an explicit upgrade path.

## Requirements
- [ ] R1: Local launchers are created under `specforge/bin`.
- [ ] R2: A vendored runtime and manifest are created under `specforge/tools`.
- [ ] R3: AI instructions name the local SpecForge commands.
- [ ] R4: Discovery and user-facing output surface CLI tooling state.

## Acceptance Criteria
- [ ] AC1: `specforge/bin/specforge validate .` is documented in bootstrapped AI instructions.
- [ ] AC2: The runtime can parse, compose, and validate a bootstrapped repository.
- [ ] AC3: Missing pieces of a partial CLI install are repaired without touching existing pieces.

## Dependencies
- F-0022

## Open Questions
- None

## Notes
The initial runtime is intentionally compact and self-contained for portability.
