# Migrate Consumer Overlay to v0.2

## ID
S-0704

## Type
Story

## Parent
F-0025

## Summary
As a consumer owner, I want my valid local v0.1 overlay migrated automatically so that execution slices can be added without manual JSON surgery.

## Problem / Context
Backward-compatible reading alone leaves the consumer file on the old contract.

## Goals
- Perform an additive migration before discovery and composition.
- Preserve repositoryId, entries, and supported metadata.
- Report the updated file.

## Non-goals
- Repair malformed or unsupported overlays automatically.

## Requirements
- [ ] R1: Migration changes version to 0.2 and adds executionSlices only.
- [ ] R2: Invalid or unknown shapes are left untouched.
- [ ] R3: Migration is idempotent.

## Acceptance Criteria
- [ ] AC1: A valid v0.1 overlay composes as v0.2 during the same load.
- [ ] AC2: A second load reports no overlay update.
- [ ] AC3: Unsupported overlay data is preserved and reported as skipped.

## Dependencies
- F-0023

## Open Questions
- None

## Notes
None
