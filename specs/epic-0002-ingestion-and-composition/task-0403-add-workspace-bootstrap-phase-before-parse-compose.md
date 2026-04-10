# Add Workspace Bootstrap Phase Before Parse/Compose

## ID
T-0403

## Type
Task

## Parent
S-0402

## Summary
Add a pre-ingestion bootstrap phase ensuring required directories/files exist.

## Problem / Context
Current load flow expects prerequisites to already exist, which causes avoidable failures in partially initialized repos.

## Goals
- Insert deterministic bootstrap before parse and composition steps.

## Non-goals
- Changing parser semantics.

## Requirements
- [ ] R1: Introduce a bootstrap step that executes before discovery/parse/compose.
- [ ] R2: Bootstrap step checks and creates only missing required artifacts.

## Acceptance Criteria
- [ ] AC1: Ingestion path calls bootstrap prior to parser/composer invocation.
- [ ] AC2: Bootstrap step is safe to run repeatedly without destructive side effects.

## Dependencies
- S-0402

## Open Questions
- Should the bootstrap phase be modeled as a standalone module or integrated into workspace loader?

## Notes
Ordering is critical: bootstrap must complete before parse/compose begins.
