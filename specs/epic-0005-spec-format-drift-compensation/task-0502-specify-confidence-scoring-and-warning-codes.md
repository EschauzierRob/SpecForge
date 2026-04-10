# Specify Confidence Scoring and Warning Codes

## ID
T-0502

## Type
Task

## Parent
S-0502

## Summary
Document deterministic confidence scoring rules and the warning taxonomy for drift findings.

## Problem / Context
Without a shared scoring and warning spec, behavior can vary across parser, validator, and UI layers.

## Goals
- Standardize confidence band definitions.
- Standardize drift warning codes and semantics.

## Non-goals
- Implementing scoring in validation runtime.

## Requirements
- [ ] R1: Define high/medium/low thresholds tied to inference signal strength.
- [ ] R2: Define warning code list for missing levels, mixed naming, orphans, and ambiguous parents.

## Acceptance Criteria
- [ ] AC1: Confidence thresholds are unambiguous enough to unit test.
- [ ] AC2: Warning catalog includes code, message template, severity, and triage guidance.

## Dependencies
- S-0502

## Open Questions
- Should severity be configurable per deployment profile?

## Notes
Documentation-only task to align ingestion, validation, and UI behavior.
