# Tolerant Parse and Hierarchy Inference

## ID
F-0015

## Type
Feature

## Parent
E-0005

## Summary
Add robust ingestion logic that accepts non-canonical repositories and infers missing relationships to create a structurally useful model.

## Problem / Context
Strictly canonical assumptions break when repositories omit levels, mix naming schemes, or define relationships implicitly.

## Goals
- Accept malformed or incomplete hierarchy input.
- Infer plausible parent-child relationships from multiple signals.
- Produce a shared inferred-edge result contract for downstream confidence, validation, projection, and UI consumers.
- Preserve ambiguous candidate sets for downstream diagnostics.
- Prove tolerant ingestion with drifted repository fixtures.

## Non-goals
- Editing source markdown files to "fix" structure.
- Selecting final confidence or warning severity policy.
- Rendering inferred structure in the UI.

## Requirements
- [ ] R1: Discovery and parsing tolerate missing feature/story layers and top-level tasks.
- [ ] R2: Inference supports multiple strategies, including name token patterns, directory adjacency, and textual references.
- [ ] R3: Inference output includes evidence metadata explaining which strategy produced each inferred edge.
- [ ] R4: Inference preserves candidate parent sets when more than one plausible parent exists.
- [ ] R5: Tests cover representative drifted repositories and assert inferred-edge evidence, not only successful parsing.

## Acceptance Criteria
- [ ] AC1: A flat spec directory can still produce a connected hierarchy projection.
- [ ] AC2: If multiple plausible parents exist, candidates are retained for ambiguity handling rather than dropped.
- [ ] AC3: Inference evidence is available for downstream validation and UI display.
- [ ] AC4: Fixture-driven tests prove missing-parent, skipped-level, flat-list, and ambiguous-parent scenarios.

## Dependencies
- F-0005
- F-0010

## Open Questions
- What minimum signal threshold should be required before creating an inferred edge?
- Should all strategies contribute evidence before edge selection, or should a fixed strategy precedence choose the edge first?

## Notes
Designed to satisfy epic requirements R1, R2, R7, and R8 while feeding confidence and drift systems.
