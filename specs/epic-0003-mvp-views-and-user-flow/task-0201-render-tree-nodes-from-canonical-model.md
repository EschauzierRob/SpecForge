# Render Tree Nodes from Canonical Model

## ID
T-0201

## Type
Task

## Parent
S-0201

## Summary
Implement view-model transformation to render canonical hierarchy as tree nodes.

## Problem / Context
UI components need a stable hierarchical shape independent of parser internals.

## Goals
- Create deterministic tree data structure.

## Non-goals
- Server-side rendering optimizations.

## Requirements
- [ ] R1: Produce ordered children arrays for each node.
- [ ] R2: Attach overlay status indicators when available.

## Acceptance Criteria
- [ ] AC1: Tree model includes id, title, type, and child references.
- [ ] AC2: Missing overlay data does not break rendering payload.

## Dependencies
- S-0201

## Open Questions
- None.

## Notes
Prefer pure transformation functions for testability.
