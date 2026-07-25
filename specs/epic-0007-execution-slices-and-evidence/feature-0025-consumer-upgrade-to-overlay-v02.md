# Consumer Upgrade to Overlay v0.2

## ID
F-0025

## Type
Feature

## Parent
E-0007

## Summary
Upgrade existing SpecForge consumers from overlay and local CLI version 0.1 to slice-capable version 0.2 during workspace bootstrap.

## Problem / Context
The current runtime reads version 0.1 overlays, but opening an existing consumer neither migrates its local overlay nor upgrades its vendored CLI tools. This leaves consumers unable to create and validate slices through their repository-local commands.

## Goals
- Migrate valid version 0.1 local overlays additively and without data loss.
- Upgrade recognized SpecForge-managed CLI artifacts to version 0.2.
- Detect customized or unknown tooling and refuse silent overwrite.
- Keep repeated workspace loads idempotent and report migration actions.

## Non-goals
- Migrate arbitrary third-party overlay formats.
- Overwrite repository-specific CLI customizations.
- Add team or personal overlay layering.

## Requirements
- [ ] R1: A valid v0.1 local overlay becomes v0.2 with an empty executionSlices collection while retaining all entries.
- [ ] R2: Generated v0.1 CLI artifacts are recognized by manifest and content identity before replacement.
- [ ] R3: Version 0.2 manifests record managed artifact hashes for future safe upgrades.
- [ ] R4: Customized, corrupt, or unknown CLI artifacts are preserved and reported as skipped.
- [ ] R5: Upgrade actions distinguish created, updated, and skipped artifacts.

## Acceptance Criteria
- [ ] AC1: Opening an untouched v0.1 consumer makes its local CLI slice-capable in one bootstrap pass.
- [ ] AC2: Opening the migrated consumer again produces no further actions.
- [ ] AC3: Existing overlay entries and repository identity remain byte-equivalent as parsed JSON values.
- [ ] AC4: A customized runtime is not overwritten and its manifest is not falsely promoted.
- [ ] AC5: Missing artifacts are repaired only when the remaining managed identity is trustworthy.

## Dependencies
- F-0014
- F-0022
- F-0023

## Open Questions
- Should a future interactive command allow users to explicitly replace customized tooling after preview?

## Notes
Automatic migration is limited to SpecForge-owned artifacts whose legacy or manifest hashes can be verified.
