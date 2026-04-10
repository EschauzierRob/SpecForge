# Project Inferred Hierarchy into Canonical View

## ID
S-0508

## Type
Story

## Parent
F-0017

## Summary
As a user loading a drifted repository, I can see a usable canonical hierarchy projection even when original files skip levels or require virtual structure.

## Problem / Context
Tolerant ingestion and confidence scoring are not enough unless the resulting structure can be rendered as a coherent hierarchy.

## Goals
- Define projection behavior for inferred edges and skipped levels.
- Decide how virtual or synthesized nodes are represented in runtime output.
- Preserve source-file immutability while making hierarchy usable.

## Non-goals
- Rewriting source markdown to canonicalize the repository.

## Requirements
- [ ] R1: Projection maps drifted inputs into an Epic -> Feature -> Story -> Task view using inferred edges and synthesized structure when necessary.
- [ ] R2: Virtual or synthesized hierarchy elements have stable identity rules if materialized in runtime output.
- [ ] R3: Projection preserves explicit versus inferred relationship metadata for UI consumers.

## Acceptance Criteria
- [ ] AC1: Fixture inputs with skipped levels render with visible hierarchy.
- [ ] AC2: Virtual or synthesized hierarchy elements are distinguishable from source-backed specs.
- [ ] AC3: Projection output can be consumed by tree and detail views without mutating source files.

## Dependencies
- F-0017
- F-0015
- F-0016

## Open Questions
- Should virtual nodes be included in `composedNodes`, or represented as separate projection-only view nodes?

## Notes
This story makes the canonical projection behavior explicit before UI rendering is implemented.
