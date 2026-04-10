# Canonical Projection and Ambiguity Visualization

## ID
F-0017

## Type
Feature

## Parent
E-0005

## Summary
Project drifted repositories into canonical hierarchy and make inferred/ambiguous structure legible in the UI.

## Problem / Context
Even with tolerant ingestion, users need a clear visualization that separates explicit structure from inferred structure.

## Goals
- Provide a usable Epic → Feature → Story → Task projection for non-canonical inputs.
- Make ambiguity and drift inspectable in tree/detail surfaces.
- Define whether projection materializes virtual nodes or renders virtual hierarchy from inferred-edge metadata.
- Support navigation from drift warnings to affected nodes or edges.

## Non-goals
- Concealing inference or warnings for cleaner aesthetics.
- Rewriting source files to make projected hierarchy canonical.

## Requirements
- [ ] R1: Projection maps all nodes into canonical levels via synthesized virtual nodes or level-skipping with warnings.
- [ ] R2: Tree/detail UI differentiates explicit edges from inferred edges.
- [ ] R3: UI affordances expose confidence and drift metadata to users inspecting a node or edge.
- [ ] R4: Projection behavior defines stable identity for virtual or synthesized hierarchy elements when they are materialized.
- [ ] R5: Warnings can navigate users to affected nodes, inferred edges, or drift hotspots.

## Acceptance Criteria
- [ ] AC1: BitBetMatic-style inputs render with visible hierarchy and annotated inferred links.
- [ ] AC2: Users can inspect why an edge was inferred and its confidence level.
- [ ] AC3: Drift hotspots are discoverable directly from visualization surfaces.
- [ ] AC4: UI annotations remain understandable without relying on color alone.

## Dependencies
- F-0015
- F-0016
- F-0007
- F-0009
- F-0011

## Open Questions
- Should virtual synthesized nodes be collapsible by default in the tree to reduce visual noise?
- Should warning navigation target nodes only in MVP, or support edge-level focus from the start?

## Notes
Implements epic requirements R4 and R6.
