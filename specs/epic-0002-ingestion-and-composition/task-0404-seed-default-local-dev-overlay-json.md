# Seed Default local-dev.overlay.json

## ID
T-0404

## Type
Task

## Parent
S-0402

## Summary
Generate valid default `local-dev.overlay.json` (`version`, `repositoryId`, `entries`).

## Problem / Context
A missing overlay file blocks runtime composition and planning-state workflows.

## Goals
- Provide a minimal valid overlay file when absent.

## Non-goals
- Populating entries for every spec ID automatically.

## Requirements
- [ ] R1: Generated file includes required top-level fields (`version`, `repositoryId`, `entries`).
- [ ] R2: Generated file conforms to overlay model contract expectations.

## Acceptance Criteria
- [ ] AC1: Bootstrap creates `specforge/overlay/local-dev.overlay.json` when missing.
- [ ] AC2: Created file parses and validates in existing overlay loading path.

## Dependencies
- S-0402
- F-0002

## Open Questions
- What default `repositoryId` value should be used before repository metadata is known?

## Notes
Keep seed content minimal and explicitly documented.
