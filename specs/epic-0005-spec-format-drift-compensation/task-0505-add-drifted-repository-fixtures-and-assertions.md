# Add Drifted Repository Fixtures and Assertions

## ID
T-0505

## Type
Task

## Parent
S-0505

## Summary
Create fixture repositories and expected-output assertions for representative drift scenarios.

## Problem / Context
Without fixtures, drift compensation behavior can regress silently or remain too loosely specified to implement safely.

## Goals
- Add fixtures for the supported drift matrix.
- Assert parse, inference, confidence, warning, and projection outputs where applicable.
- Keep fixtures read-only.

## Non-goals
- Modeling every external repository convention.

## Requirements
- [ ] R1: Fixtures include BitBetMatic-style input, flat task list, skipped hierarchy, missing parent, mixed naming, orphan node, and ambiguous parent scenarios.
- [ ] R2: Tests assert expected inferred-edge evidence and warnings for each fixture.
- [ ] R3: Tests verify fixture files are not modified by ingestion.

## Acceptance Criteria
- [ ] AC1: Fixture suite fails when inferred-edge evidence changes unexpectedly.
- [ ] AC2: Fixture suite confirms tolerant ingestion still returns usable composed output.
- [ ] AC3: Source fixture files remain unchanged after test runs.

## Dependencies
- S-0505
- T-0504

## Open Questions
- Should fixture expectations be stored as inline assertions or snapshot JSON artifacts?

## Notes
This task makes real-world drift acceptance criteria executable.
