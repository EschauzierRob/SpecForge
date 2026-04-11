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
- [x] R1: Contract includes inferred parent ID, selected edge state, candidate set, strategy ID, and evidence fields.
- [x] R2: Evidence schema supports strategy-specific details for naming, directory adjacency, and textual-reference signals.
- [x] R3: Contract identifies stable IDs or keys needed by confidence scoring, validation findings, and UI navigation.

## Acceptance Criteria
- [x] AC1: Spec documents mandatory and optional fields for inferred-edge payloads.
- [x] AC2: Documentation examples cover at least naming-based and file-structure-based inference.
- [x] AC3: The contract distinguishes selected, candidate, ambiguous, and rejected relationships.

## Dependencies
- S-0501

## Open Questions
- Should evidence include normalized score components per strategy for explainability?

## Notes
Documentation-only task to unblock implementation planning.

Runtime contract:
- `InferenceResult` is optional on parse, compose, and ingest results and contains `relationships`.
- Each relationship includes `key`, `childId`, `childSourcePath`, optional `explicitParentId`, optional `selectedParentId`, `state`, and `candidates`.
- Relationship states are `explicit`, `inferred`, `ambiguous`, and `unresolved`; S-0501 currently emits inferred, ambiguous, or unresolved records only when inference work was required.
- Each candidate includes `key`, `parentId`, `parentSourcePath`, `state`, `supportScore`, and `evidence`.
- Candidate states are `selected`, `candidate`, `ambiguous`, and `rejected`.
- Each evidence item includes `strategyId`, `source`, `matchedSignal`, `weight`, and strategy-specific `details`.

Strategy IDs and example evidence:
- `naming`: shared numeric tokens, shared title tokens, or parent ID references found in child ID/title/source path.
- `directory-adjacency`: same-directory or ancestor-directory source path proximity.
- `content-reference`: known parent IDs or normalized parent titles referenced in parsed fields such as summary, requirements, acceptance criteria, dependencies, notes, or description.

Selection semantics:
- A content ID reference can select a unique expected-type parent by itself.
- Weaker non-content signals require at least two strategy families before selection, such as naming plus directory adjacency.
- Equal top candidates are retained as ambiguous and do not mutate `parentId`.
- Below-threshold candidates are retained as rejected evidence for downstream diagnostics.
