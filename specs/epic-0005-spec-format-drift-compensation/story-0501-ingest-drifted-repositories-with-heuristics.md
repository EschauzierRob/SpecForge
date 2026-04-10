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
