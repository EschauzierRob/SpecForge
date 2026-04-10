# Add Tests for Bootstrap in Discovery/Ingest/CLI

## ID
T-0406

## Type
Task

## Parent
S-0402

## Summary
Verify behavior across missing-overlay scenarios.

## Problem / Context
Bootstrap behavior spans discovery, ingestion, and output layers and requires targeted regression coverage.

## Goals
- Validate bootstrap correctness in unit/integration coverage.

## Non-goals
- Full end-to-end test matrix for unrelated ingestion paths.

## Requirements
- [ ] R1: Add tests for repositories missing `specforge/overlay` directory.
- [ ] R2: Add tests for repositories missing `local-dev.overlay.json` only.
- [ ] R3: Add tests that verify CLI/API bootstrap summaries.

## Acceptance Criteria
- [ ] AC1: Test suite confirms bootstrap creates required artifacts for each missing-overlay scenario.
- [ ] AC2: Test suite confirms ingestion proceeds after bootstrap.
- [ ] AC3: Test suite confirms action reporting is present and accurate.

## Dependencies
- S-0402
- T-0403
- T-0404
- T-0405

## Open Questions
- Should bootstrap tests run in existing ingestion integration suite or dedicated bootstrap suite?

## Notes
Prioritize deterministic fixtures that isolate missing-artifact cases.
