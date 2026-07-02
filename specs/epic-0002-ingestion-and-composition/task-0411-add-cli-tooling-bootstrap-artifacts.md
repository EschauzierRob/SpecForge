# Add CLI Tooling Bootstrap Artifacts

## ID
T-0411

## Type
Task

## Parent
S-0411

## Summary
Create deterministic local SpecForge CLI files during workspace bootstrap.

## Problem / Context
Bootstrap currently creates metadata and instructions but no runnable CLI tools.

## Goals
- Add launchers for PowerShell, Windows cmd, and POSIX shells.
- Add a vendored CLI runtime, manifest, and README.
- Preserve idempotent no-overwrite behavior.

## Non-goals
- Implementing runtime artifact upgrades.

## Requirements
- [ ] R1: Bootstrap writes missing files under `specforge/bin` and `specforge/tools`.
- [ ] R2: Existing files are not overwritten.
- [ ] R3: Bootstrap summaries list created CLI artifacts.

## Acceptance Criteria
- [ ] AC1: Bootstrap tests include the new CLI artifact paths.
- [ ] AC2: Re-running bootstrap after a complete install creates no new artifacts.

## Dependencies
- S-0411

## Open Questions
- None

## Notes
This task owns artifact creation only.
