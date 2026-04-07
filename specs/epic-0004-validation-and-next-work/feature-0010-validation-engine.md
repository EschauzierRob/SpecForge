# Validation Engine

## ID
F-0010

## Type
Feature

## Parent
E-0004

## Summary
Run a defined rule set across canonical and overlay models to emit structured findings.

## Problem / Context
Malformed specs or overlays can silently degrade trust in board and recommendation outputs.

## Goals
- Implement rule evaluation pipeline.
- Standardize finding objects for downstream UI usage.

## Non-goals
- Auto-remediation.

## Requirements
- [ ] R1: Implement rules listed in docs/validation-rules.md.
- [ ] R2: Emit finding objects with severity, ruleId, message, and source.
- [ ] R3: Support aggregate summary counts by severity.

## Acceptance Criteria
- [ ] AC1: Rule execution is deterministic and repeatable.
- [ ] AC2: Invalid overlay references produce findings without aborting run.
- [ ] AC3: Findings include enough context for users to locate source issues.

## Dependencies
- F-0005
- F-0006

## Open Questions
- Should parser diagnostics and validation findings share a unified schema?

## Notes
Validation outputs are first-class input to UI and CLI diagnostics.
