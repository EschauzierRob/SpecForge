# Execution Slice Overlay Contract

## ID
F-0023

## Type
Feature

## Parent
E-0007

## Summary
Extend the overlay contract with structured execution slices, work, evidence, provenance, decisions, blockers, and closure semantics.

## Problem / Context
The version 0.1 overlay only attaches planning metadata to individual specs and rejects additional top-level data.

## Goals
- Add a backward-compatible version 0.2 executionSlices collection.
- Validate slice structure and cross-references deterministically.
- Keep thematic execution work owned by one slice through structural containment.

## Non-goals
- Add bundles or layered team overlays.
- Infer slice contents from canonical acceptance criteria.

## Requirements
- [ ] R1: Slice work references existing canonical specs and declares a research, design, implementation, validation, or documentation type.
- [ ] R2: Required evidence has stable IDs and observed evidence explicitly identifies which requirements it satisfies.
- [ ] R3: External evidence provenance includes an immutable commit and repository identity.
- [ ] R4: Blocked slices identify open blockers and completed slices identify a resolution.
- [ ] R5: Ordinary overlay entries tagged incidental remain outside thematic slice WIP accounting.

## Acceptance Criteria
- [ ] AC1: Both version 0.1 and 0.2 overlay files compose successfully.
- [ ] AC2: Unsupported slice shapes produce actionable diagnostics without silently accepting partial objects.
- [ ] AC3: Public runtime types expose the complete execution slice contract.

## Dependencies
- F-0002
- F-0006

## Open Questions
- None

## Notes
linkedSpecIds are scope links, not canonical parent relationships.
