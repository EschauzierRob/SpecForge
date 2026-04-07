# Hierarchical Tree View

## ID
F-0007

## Type
Feature

## Parent
E-0003

## Summary
Provide a navigable tree of Epic → Feature → Story → Task showing composed state cues.

## Problem / Context
Users need an at-a-glance structure of all defined work and its decomposition.

## Goals
- Render full hierarchy with expand/collapse.
- Show lightweight status indicators from overlay.

## Non-goals
- Advanced graph visualization.

## Requirements
- [ ] R1: Tree renders all canonical nodes in deterministic order.
- [ ] R2: Selected node updates detail panel context.
- [ ] R3: Visual indicators show planningStatus and blocked state where available.

## Acceptance Criteria
- [ ] AC1: User can expand/collapse each level independently.
- [ ] AC2: Selection persists when switching to other panels and back.
- [ ] AC3: Tree gracefully handles nodes with missing overlay entries.

## Dependencies
- F-0006

## Open Questions
- Should default sort order be by ID or overlay rank when available?

## Notes
Use canonical hierarchy as structural source; overlay is decorative/contextual here.
