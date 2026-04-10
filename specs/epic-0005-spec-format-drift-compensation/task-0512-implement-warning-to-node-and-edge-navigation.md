# Implement Warning to Node and Edge Navigation

## ID
T-0512

## Type
Task

## Parent
S-0509

## Summary
Implement navigation from drift warnings to affected nodes, inferred edges, or projection hotspots.

## Problem / Context
Drift warnings become more actionable when users can jump directly to the ambiguous or low-confidence structure in context.

## Goals
- Resolve warning targets to UI selection or focus state.
- Support node-level and edge-level navigation where metadata is available.
- Degrade gracefully for unresolved or virtual-only targets.

## Non-goals
- Editing inferred relationships from the warning view.

## Requirements
- [ ] R1: Warning selection resolves affected spec IDs, inferred-edge keys, or virtual projection keys to UI focus targets.
- [ ] R2: Navigation preserves inferred/explicit annotation state after focus.
- [ ] R3: Unresolvable targets remain visible with source-path context and no broken interaction.

## Acceptance Criteria
- [ ] AC1: Ambiguous-parent and low-confidence findings can navigate to affected hierarchy context.
- [ ] AC2: Warning navigation tests cover resolved, virtual, and unresolved targets.
- [ ] AC3: Users receive clear feedback when a warning cannot focus a specific node or edge.

## Dependencies
- S-0509
- T-0508
- T-0511

## Open Questions
- Should edge focus use a dedicated selection state or reuse selected-node detail with highlighted relationship rows?

## Notes
Implementation task for actionable drift warning navigation.
