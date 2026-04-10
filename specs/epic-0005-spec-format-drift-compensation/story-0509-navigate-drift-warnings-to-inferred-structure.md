# Navigate Drift Warnings to Inferred Structure

## ID
S-0509

## Type
Story

## Parent
F-0017

## Summary
As a user reviewing drift warnings, I can navigate directly to affected nodes or inferred edges so I can inspect ambiguity in context.

## Problem / Context
Warnings are less useful if users must manually search the tree to understand which inferred relationship or drift hotspot is involved.

## Goals
- Connect validation findings to visual hierarchy targets.
- Focus affected nodes, edges, or virtual hierarchy placeholders when possible.
- Explain unresolved targets gracefully.

## Non-goals
- Full graph-debugging tooling for every inference candidate.

## Requirements
- [ ] R1: Drift findings expose enough target data for UI navigation to affected nodes, edges, or hotspots.
- [ ] R2: Warning interactions focus the relevant tree/detail context when the target is resolvable.
- [ ] R3: Unresolvable targets remain visible in warnings with clear context and source paths.

## Acceptance Criteria
- [ ] AC1: Users can navigate from ambiguous-parent and low-confidence warnings to the affected hierarchy context.
- [ ] AC2: Navigation preserves explicit/inferred annotation state after focus.
- [ ] AC3: Warnings for unresolved or virtual-only targets degrade gracefully without dead links.

## Dependencies
- F-0017
- S-0507
- S-0508

## Open Questions
- Should warning navigation target nodes only in MVP, or should it support edge-level focus from the start?

## Notes
This story turns drift warnings into actionable inspection workflows.
