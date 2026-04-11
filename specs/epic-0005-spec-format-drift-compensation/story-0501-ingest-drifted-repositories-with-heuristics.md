# Ingest Drifted Repositories with Heuristics

## ID
S-0501

## Type
Story

## Parent
F-0015

## Summary
As a user loading a real-world repo, I can ingest non-canonical markdown specs and still receive a connected hierarchy model.

## Problem / Context
Users cannot always clean repositories into canonical format before trying SpecForge.

## Goals
- Keep ingestion resilient in the presence of structure drift.
- Produce inferred links when explicit parents are missing.
- Retain evidence for the inference strategy that produced each candidate link.

## Non-goals
- Attempting to mutate upstream files to enforce structure.

## Requirements
- [ ] R1: Parsing continues when canonical parent levels are absent.
- [ ] R2: Heuristics evaluate naming, file location, and in-file references to infer parents.
- [ ] R3: Inference output includes candidate parent sets and evidence for each accepted or ambiguous candidate.

## Acceptance Criteria
- [ ] AC1: Ingestion succeeds for mixed-level repositories that currently produce partial trees.
- [ ] AC2: Inferred links retain provenance fields for each heuristic used.
- [ ] AC3: Multiple plausible parents are preserved for ambiguity reporting instead of silently choosing one.

## Dependencies
- F-0004
- F-0005

## Open Questions
- Should heuristic precedence be globally fixed or configurable per repository profile?

## Notes
Story focused on ingestion and inferred-edge generation.

Runtime implementation notes:
- Discovery should include drifted markdown spec files under `specs/` even when file names are not canonical, while continuing to ignore general docs and templates such as `README.md` and `specs/templates/**`.
- `CanonicalNode.parentId` is the effective runtime parent. When inference selects a parent, ingestion materializes that selected parent into the in-memory node and recomputes `childrenIds`; source markdown is never rewritten.
- Parse, compose, and ingest results may include optional `inference` metadata when drift handling had work to report. Canonical repositories with only valid explicit parents omit the metadata.
- Inference metadata preserves original explicit parent IDs, selected parent IDs, candidate parents, candidate state, support score, strategy evidence, source paths, and stable edge/candidate keys.
- Confidence scoring, drift validation findings, virtual projection, and UI annotations remain owned by later stories.
