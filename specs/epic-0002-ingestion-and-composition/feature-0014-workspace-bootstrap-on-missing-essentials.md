# Workspace Bootstrap on Missing Essentials

## ID
F-0014

## Type
Feature

## Parent
E-0002

## Summary
When loading a repo missing `specforge/overlay` and related essentials, inject required files so workspace becomes operable immediately.

## Problem / Context
Partially initialized repositories fail during ingestion when required SpecForge directories and files are absent.

## Goals
- Auto-create required SpecForge directories/files at load time when missing.
- Allow ingestion pipeline to continue after deterministic bootstrap.
- Surface bootstrap actions to users for transparency.
- Seed AI-facing instructions so coding agents follow SpecForge specs and overlay conventions.

## Non-goals
- Overwriting existing valid user-managed files.
- Introducing optional scaffolding unrelated to ingestion readiness.
- Overwriting repository-specific agent instructions.

## Requirements
- [ ] R1: Workspace load includes a bootstrap phase that runs before parse/compose.
- [ ] R2: Bootstrap phase creates missing required directories/files for SpecForge essentials.
- [ ] R3: Bootstrap phase seeds a valid default `specforge/overlay/local-dev.overlay.json` when missing.
- [ ] R4: CLI/API output summarizes bootstrap actions taken.
- [ ] R5: Bootstrap phase seeds AI-facing SpecForge workflow instructions when missing.
- [ ] R6: Bootstrap phase does not overwrite existing root `AGENTS.md`.

## Acceptance Criteria
- [ ] AC1: Loading a repository with no `specforge/overlay` succeeds and creates required artifacts.
- [ ] AC2: Seeded overlay file validates against the overlay model contract.
- [ ] AC3: User-facing output includes a list/count of created artifacts.
- [ ] AC4: Bootstrapped repositories include instructions that tell AI coders to use `/specs` for product intent and `specforge/overlay/local-dev.overlay.json` for execution metadata.
- [ ] AC5: Existing repository-specific AI instructions are preserved.

## Dependencies
- F-0004
- F-0006

## Open Questions
- Should bootstrap run by default in all environments or be gated by a flag in strict mode?

## Notes
Bootstrap must be idempotent and safe for repeated workspace loads.
