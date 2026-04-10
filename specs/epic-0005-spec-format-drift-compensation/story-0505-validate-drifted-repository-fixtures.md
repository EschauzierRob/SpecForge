# Validate Drifted Repository Fixtures

## ID
S-0505

## Type
Story

## Parent
F-0015

## Summary
As a maintainer, I can run fixture-driven tests for representative drift cases so tolerant ingestion behavior stays deterministic.

## Problem / Context
The epic names BitBetMatic and real-world drift, but the child cards do not yet require concrete fixture coverage for the messy inputs the feature is meant to support.

## Goals
- Define a representative drift fixture matrix.
- Prove ingestion succeeds without source-file mutation.
- Assert inferred-edge evidence, not just successful parse counts.

## Non-goals
- Covering every possible non-canonical repository layout.

## Requirements
- [ ] R1: Fixture coverage includes BitBetMatic-style input, flat task lists, skipped hierarchy levels, missing parent fields, mixed naming, orphan nodes, and ambiguous parent candidates.
- [ ] R2: Tests assert inferred relationships, candidate sets, evidence, and unresolved ambiguity where applicable.
- [ ] R3: Fixtures remain read-only inputs and are not rewritten by ingestion.

## Acceptance Criteria
- [ ] AC1: Each supported drift case has at least one fixture and expected output assertion.
- [ ] AC2: Re-running fixture tests produces stable inferred-edge outputs.
- [ ] AC3: Fixture coverage demonstrates that source files are not modified during tolerant ingestion.

## Dependencies
- S-0501
- S-0504

## Open Questions
- Should BitBetMatic-style fixtures be checked into `examples/`, `tests/fixtures/`, or both?

## Notes
This story makes acceptance criteria executable and prevents the epic from staying purely conceptual.
