# Implement Inference Candidate Strategies

## ID
T-0504

## Type
Task

## Parent
S-0501

## Summary
Implement initial deterministic inference strategies for naming patterns, directory adjacency, and in-content references.

## Problem / Context
The tolerant ingestion feature needs concrete inference strategies that generate candidate parent links with evidence rather than relying on a single hard-coded fallback.

## Goals
- Generate candidate parent links from multiple deterministic signals.
- Attach evidence for each strategy contribution.
- Preserve ambiguous candidate sets.

## Non-goals
- Pluggable third-party inference engines.

## Requirements
- [ ] R1: Naming-based inference produces candidates from shared numeric tokens, title tokens, or ID-like references.
- [ ] R2: Directory-adjacency inference produces candidates from nearby files and folders.
- [ ] R3: Textual-reference inference produces candidates from in-content references to known spec IDs or titles.
- [ ] R4: Strategy outputs use the shared inference result contract.

## Acceptance Criteria
- [ ] AC1: Each strategy has unit coverage for accepted and rejected candidate scenarios.
- [ ] AC2: Ambiguous candidates remain available for confidence and validation processing.
- [ ] AC3: Strategy evidence is present in composed or projection-ready output.

## Dependencies
- S-0501
- S-0504

## Open Questions
- Should strategies run in fixed priority order, or should all strategies contribute evidence before a selector chooses the edge?

## Notes
Implementation task for initial deterministic heuristic generation.
