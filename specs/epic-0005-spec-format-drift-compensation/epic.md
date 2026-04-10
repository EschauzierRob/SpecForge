# Spec Format Drift Compensation

## ID
E-0005

## Type
Epic

## Parent
None

## Summary
Enable SpecForge to ingest and normalize real-world spec repositories that deviate from canonical structure, without requiring manual cleanup before loading.

## Problem / Context
Real-world repositories often have missing hierarchy levels, mixed naming conventions, top-level tasks, implicit parent relationships, and partial structure. Strict parsing assumptions make these repos hard to visualize and plan against.

The expected drift cases include missing parent fields, skipped hierarchy levels, flat task lists, mixed file naming, orphan nodes, ambiguous parent candidates, and inferred virtual parents.

## Goals
- Tolerate imperfect spec structures during ingestion.
- Infer missing hierarchy relationships where evidence supports it.
- Surface ambiguity and drift explicitly instead of hiding it.
- Preserve deterministic evidence for every inferred relationship.
- Prove behavior with fixture coverage for representative drifted repositories.
- Project non-canonical repos into a usable Epic → Feature → Story → Task view.

## Non-goals
- Auto-rewriting user spec files.
- Enforcing canonical structure at ingestion time.
- Masking inconsistencies behind silent assumptions.

## Requirements
- [ ] R1: Parser accepts missing hierarchy levels, inconsistent naming, and flat structures without failing ingestion.
- [ ] R2: Inference engine derives parent-child relationships from naming patterns, file structure, and in-content references.
- [ ] R3: Every inferred relationship includes a confidence level (high/medium/low).
- [ ] R4: Ingested data is projected into Epic → Feature → Story → Task using synthesized virtual levels or warnings when levels are skipped.
- [ ] R5: Drift detection emits warnings for missing levels, mixed naming, orphan nodes, and ambiguous parents.
- [ ] R6: UI distinguishes explicit vs inferred links and highlights ambiguity/drift areas for inspection.
- [ ] R7: Inference output includes selected edges, candidate parents, strategy evidence, and ambiguity state.
- [ ] R8: Fixture coverage includes BitBetMatic-style inputs, flat task lists, skipped hierarchy levels, missing parent fields, mixed naming, orphan nodes, and ambiguous parent candidates.

## Acceptance Criteria
- [ ] AC1: BitBetMatic specs load without source-file modifications.
- [ ] AC2: Hierarchy is visible even when partially inferred.
- [ ] AC3: Drift findings are surfaced clearly as validation warnings.
- [ ] AC4: A user can understand structure without reading raw files.
- [ ] AC5: Inferred-edge metadata, confidence, and drift warnings are available through stable runtime contracts for validation and UI consumers.
- [ ] AC6: Fixture tests prove deterministic outputs across repeated runs.

## Dependencies
- E-0002
- E-0003
- E-0004

## Open Questions
- Should confidence scoring be deterministic-only for MVP, or allow pluggable heuristics later?
- Should synthesized virtual nodes receive stable synthetic IDs across runs?
- Should synthesized virtual nodes be materialized in runtime output or represented only in projection metadata?
- Should drift warning navigation target nodes only in MVP, or support edge-level focus from the start?

## Notes
This epic extends ingestion, validation, and visualization behavior while preserving source-of-truth files as read-only input.
Feature split: `F-0015` owns tolerant ingestion and inferred-edge evidence, `F-0016` owns deterministic confidence plus drift warnings, and `F-0017` owns canonical projection plus user-facing ambiguity inspection.
