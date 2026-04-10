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

## Non-goals
- Editing source markdown files to "fix" structure.

## Requirements
- [ ] R1: Discovery and parsing tolerate missing feature/story layers and top-level tasks.
- [ ] R2: Inference supports multiple strategies, including name token patterns, directory adjacency, and textual references.
- [ ] R3: Inference output includes evidence metadata explaining which strategy produced each inferred edge.

## Acceptance Criteria
- [ ] AC1: A flat spec directory can still produce a connected hierarchy projection.
- [ ] AC2: If multiple plausible parents exist, candidates are retained for ambiguity handling rather than dropped.
- [ ] AC3: Inference evidence is available for downstream validation and UI display.

## Dependencies
- F-0005
- F-0010

## Open Questions
- What minimum signal threshold should be required before creating an inferred edge?

## Notes
Designed to satisfy epic requirements R1 and R2 while feeding confidence and drift systems.
