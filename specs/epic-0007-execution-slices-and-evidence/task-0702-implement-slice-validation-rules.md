# Implement Slice Validation Rules

## ID
T-0702

## Type
Task

## Parent
S-0702

## Summary
Implement deterministic validation findings for slice references, WIP, lifecycle, blockers, and evidence closure.

## Problem / Context
Invalid execution state would otherwise produce misleading planning output.

## Goals
- Add slice validation rules and documentation.
- Cover positive and negative outcomes with tests.

## Non-goals
- Enforce policy by mutating overlay files.

## Requirements
- [ ] R1: Findings contain source paths and slice IDs where applicable.
- [ ] R2: Validation order and summaries remain deterministic.

## Acceptance Criteria
- [ ] AC1: Tests cover unknown references, duplicate slice IDs, WIP overflow, invalid blockers, and invalid resolutions.
- [ ] AC2: The repository validates without slice errors after implementation.

## Dependencies
- T-0701

## Open Questions
- None

## Notes
None
