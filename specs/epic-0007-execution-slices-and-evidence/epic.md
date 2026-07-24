# Execution Slices and Evidence

## ID
E-0007

## Type
Epic

## Parent
None

## Summary
Add first-class execution slices as an operational planning and evidence layer above canonical specs.

## Problem / Context
Canonical Tasks describe intended work but do not identify the bounded package currently being executed, its entry conditions, its evidence threshold, or the decision reached after execution.

## Goals
- Represent bounded execution slices without extending the canonical Epic, Feature, Story, and Task hierarchy.
- Preserve an auditable distinction between required evidence and observed evidence.
- Enforce low thematic WIP while allowing small incidental fixes to be completed without blocking the active slice.
- Expose slice state and evidence through SpecForge's runtime, validation, CLI, API, and read-only UI.

## Non-goals
- Define team, sprint, or personal overlay layering.
- Introduce first-class bundles before their lifecycle and invariants are proven by use.
- Copy canonical acceptance criteria into slices.
- Build workflow automation or a generic experiment runner.

## Requirements
- [ ] R1: Execution slices remain additive overlay data linked to canonical specs by stable IDs.
- [ ] R2: Slice lifecycle uses the existing planning status vocabulary.
- [ ] R3: At most one thematic slice is active, including a blocked active slice.
- [ ] R4: Incidental work may proceed outside a slice when explicitly tagged and kept bounded.
- [ ] R5: Slice closure records evidence coverage, resolution, decisions, and negative outcomes.

## Acceptance Criteria
- [ ] AC1: Existing version 0.1 overlays continue to load.
- [ ] AC2: Version 0.2 overlays can contain validated execution slices.
- [ ] AC3: Invalid references, excessive thematic WIP, and unsupported evidence closure are reported.
- [ ] AC4: A user can inspect slice scope, work, evidence, blockers, resolution, and next action.

## Dependencies
- E-0001
- E-0002
- E-0004

## Open Questions
- What first-class behavior, if any, should distinguish a future bundle from a tag or ordered slice list?

## Notes
A done slice is closed, not necessarily successful. Resolution records whether its hypothesis was validated, disproved, or deliberately killed.
