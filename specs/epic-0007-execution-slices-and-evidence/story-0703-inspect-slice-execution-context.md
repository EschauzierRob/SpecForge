# Inspect Slice Execution Context

## ID
S-0703

## Type
Story

## Parent
F-0024

## Summary
As a SpecForge user, I want a focused slice view so that I can see current scope, evidence, outcome, and next action without reading raw JSON.

## Problem / Context
The existing tree and board are projections of canonical specs and should not be overloaded with cross-cutting slice structure.

## Goals
- Add a separate read-only slice screen.
- Keep navigation to canonical work available.

## Non-goals
- Place slices inside the canonical tree.

## Requirements
- [ ] R1: The active slice is visually distinguishable.
- [ ] R2: Required and observed evidence remain visibly separate.
- [ ] R3: Negative closure resolutions are shown without implying success.

## Acceptance Criteria
- [ ] AC1: Empty, active, blocked, and completed slice states render safely.
- [ ] AC2: Slice work links navigate to canonical detail.

## Dependencies
- S-0702

## Open Questions
- None

## Notes
None
