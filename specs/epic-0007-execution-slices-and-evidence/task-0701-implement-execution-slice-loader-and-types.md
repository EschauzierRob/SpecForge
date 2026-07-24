# Implement Execution Slice Loader and Types

## ID
T-0701

## Type
Task

## Parent
S-0701

## Summary
Implement the public runtime types and strict overlay loader support for execution slices.

## Problem / Context
Execution slice data cannot currently enter the SpecForge runtime.

## Goals
- Add typed slice contracts.
- Extend loader and schema behavior.
- Add loader regression tests.

## Non-goals
- Add write operations.

## Requirements
- [ ] R1: Keep parsing deterministic and reject unsupported properties.
- [ ] R2: Do not weaken existing overlay entry validation.

## Acceptance Criteria
- [ ] AC1: Type checking and loader tests cover valid and invalid slices.
- [ ] AC2: Existing overlay tests remain green.

## Dependencies
- None

## Open Questions
- None

## Notes
None
