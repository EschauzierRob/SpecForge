# Overlay Model and Composition Boundary

## ID
F-0002

## Type
Feature

## Parent
E-0001

## Summary
Define how planning metadata is represented externally and linked to source specs through stable IDs.

## Problem / Context
Planning metadata changes often and should not mutate spec artifacts. Lack of boundary leads to source pollution and brittle workflows.

## Goals
- Define overlay field set for MVP planning needs.
- Define composition semantics and non-mutation rule.

## Non-goals
- Build overlay editing UX.

## Requirements
- [ ] R1: Provide documented overlay fields and expected types.
- [ ] R2: Include example overlay schema and sample payload.
- [ ] R3: Document unknown/missing spec ID handling behavior.

## Acceptance Criteria
- [ ] AC1: Overlay docs explain why planning fields stay outside specs.
- [ ] AC2: Example JSON demonstrates linking by specId.
- [ ] AC3: Composition rules are clear enough to implement deterministic merge behavior.

## Dependencies
- F-0001

## Open Questions
- Should planningStatus vocabulary be configurable per repository in v1.x?

## Notes
Overlay is a projection layer and must remain optional and additive.
