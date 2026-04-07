# Implement Overlay Index by specId

## ID
T-0102

## Type
Task

## Parent
S-0102

## Summary
Create an in-memory overlay index keyed by `specId` for fast composition and validation lookup.

## Problem / Context
Linear scans across overlay entries will not scale.

## Goals
- Enable O(1) lookup for specId mapping.

## Non-goals
- Multi-layer overlay precedence logic.

## Requirements
- [ ] R1: Build map structure with duplicate key detection.
- [ ] R2: Expose unknown reference reporting hooks.

## Acceptance Criteria
- [ ] AC1: Composition path uses index rather than repeated array scans.
- [ ] AC2: Duplicate overlay entries for same specId are flagged.

## Dependencies
- S-0102

## Open Questions
- None.

## Notes
Supports future multi-file merge behavior.
