# Produce Shared Inference Result Contract

## ID
S-0504

## Type
Story

## Parent
F-0015

## Summary
As a downstream validation or UI consumer, I can rely on a shared inference result contract that describes inferred edges, candidates, evidence, and ambiguity consistently.

## Problem / Context
The existing cards mention evidence, candidates, confidence, and UI annotations, but they do not yet define one shared runtime shape. Without a shared contract, ingestion, validation, projection, and UI work can drift.

## Goals
- Define the inference result shape before runtime consumers depend on it.
- Preserve candidate relationships rather than collapsing ambiguity too early.
- Make the contract usable by confidence scoring, drift validation, and UI navigation.

## Non-goals
- Selecting final UI styling for inferred-edge annotations.

## Requirements
- [ ] R1: Inference output includes selected inferred parent, candidate parents, evidence, strategy identifiers, and ambiguity state.
- [ ] R2: Inference output exposes stable keys suitable for confidence scoring, validation findings, and UI navigation.
- [ ] R3: The contract distinguishes explicit relationships from inferred, ambiguous, and unresolved relationships.

## Acceptance Criteria
- [ ] AC1: Validation and UI work can consume inferred-edge data without inventing separate shapes.
- [ ] AC2: Ambiguous parent candidates remain visible to downstream consumers.
- [ ] AC3: Contract examples cover naming, path adjacency, and in-content reference evidence.

## Dependencies
- F-0015

## Open Questions
- Should inferred-edge identifiers be derived from child ID plus candidate parent ID, or from source path plus strategy ID?

## Notes
This story should land before confidence, validation, projection, or UI implementation depends on inferred structure.
