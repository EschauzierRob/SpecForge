# Define Projection Model and Virtual Node Identity

## ID
T-0510

## Type
Task

## Parent
S-0508

## Summary
Define how inferred hierarchy projection represents virtual or synthesized nodes and stable identity.

## Problem / Context
Projection cannot be implemented safely until the team decides whether virtual hierarchy appears in runtime nodes, view-only models, or separate projection metadata.

## Goals
- Define projection output shape.
- Define stable identity rules for virtual or synthesized nodes.
- Preserve explicit versus inferred relationship metadata.

## Non-goals
- Building tree UI components.

## Requirements
- [ ] R1: Projection contract specifies whether virtual nodes are materialized as composed nodes, projection-only nodes, or metadata.
- [ ] R2: Virtual identity rules are deterministic across repeated runs on unchanged input.
- [ ] R3: Projection output carries enough metadata for tree/detail rendering and warning navigation.

## Acceptance Criteria
- [ ] AC1: Implementers can produce a canonical hierarchy projection without making new shape decisions.
- [ ] AC2: Virtual node IDs or keys remain stable for unchanged fixture inputs.
- [ ] AC3: Projection contract distinguishes source-backed nodes from virtual or synthesized elements.

## Dependencies
- S-0508
- T-0506

## Open Questions
- Should virtual nodes ever be exposed through public API responses, or kept entirely inside UI view models?

## Notes
Contract task for projection and virtual hierarchy behavior.
