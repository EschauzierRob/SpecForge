# Implement Safe Overlay v0.2 Migration

## ID
T-0704

## Type
Task

## Parent
S-0704

## Summary
Implement bootstrap-time migration and reporting for supported version 0.1 local overlays.

## Problem / Context
The bootstrap currently creates missing overlays but never upgrades existing ones.

## Goals
- Add a deterministic migration function.
- Extend bootstrap action reporting with update and skip semantics.
- Add preservation and idempotency tests.

## Non-goals
- Build a general migration framework for every future contract.

## Requirements
- [ ] R1: Parse and validate the minimum legacy shape before writing.
- [ ] R2: Never partially write a failed migration.

## Acceptance Criteria
- [ ] AC1: Migration tests cover success, repeat load, and unsupported shape.
- [ ] AC2: Existing bootstrap creation tests remain green.

## Dependencies
- None

## Open Questions
- None

## Notes
None
