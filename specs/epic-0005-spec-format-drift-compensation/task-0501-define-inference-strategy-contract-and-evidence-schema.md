# Define Inference Strategy Contract and Evidence Schema

## ID
T-0501

## Type
Task

## Parent
S-0501

## Summary
Specify strategy interfaces and evidence payload fields used to infer hierarchy edges.

## Problem / Context
Inference strategies must produce consistent outputs so downstream confidence and UI logic can consume them.

## Goals
- Define strategy input/output contract.
- Define evidence schema for inferred links.

## Non-goals
- Implementing strategies in runtime code.

## Requirements
- [ ] R1: Contract includes inferred parent ID, selected edge state, candidate set, strategy ID, and evidence fields.
- [ ] R2: Evidence schema supports strategy-specific details for naming, directory adjacency, and textual-reference signals.
- [ ] R3: Contract identifies stable IDs or keys needed by confidence scoring, validation findings, and UI navigation.

## Acceptance Criteria
- [ ] AC1: Spec documents mandatory and optional fields for inferred-edge payloads.
- [ ] AC2: Documentation examples cover at least naming-based and file-structure-based inference.
- [ ] AC3: The contract distinguishes selected, candidate, ambiguous, and rejected relationships.

## Dependencies
- S-0501

## Open Questions
- Should evidence include normalized score components per strategy for explainability?

## Notes
Documentation-only task to unblock implementation planning.
