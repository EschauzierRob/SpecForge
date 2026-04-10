# Add Confidence and Drift Regression Tests

## ID
T-0509

## Type
Task

## Parent
S-0507

## Summary
Add regression tests that lock deterministic confidence bands and drift warning outputs for fixture scenarios.

## Problem / Context
Confidence and warning behavior will be easy to accidentally change unless fixture outputs are explicitly asserted.

## Goals
- Verify confidence bands for supported inference scenarios.
- Verify drift warning taxonomy and severity.
- Protect repeated-run determinism.

## Non-goals
- Snapshotting unrelated parse output.

## Requirements
- [ ] R1: Tests assert confidence bands and rationale for representative inferred edges.
- [ ] R2: Tests assert drift warning code, severity, source paths, and affected spec IDs for each drift category.
- [ ] R3: Tests verify repeated runs produce identical warning output ordering.

## Acceptance Criteria
- [ ] AC1: Confidence and drift tests fail on nondeterministic output.
- [ ] AC2: Every supported warning category has at least one assertion.
- [ ] AC3: Tests cover both canonical-no-drift and drifted-input paths.

## Dependencies
- S-0507
- T-0505
- T-0508

## Open Questions
- Should expected outputs be stored as fixtures to simplify review of taxonomy changes?

## Notes
Regression task for diagnostics stability.
