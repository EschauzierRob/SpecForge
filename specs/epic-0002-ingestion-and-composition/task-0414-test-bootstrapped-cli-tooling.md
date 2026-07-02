# Test Bootstrapped CLI Tooling

## ID
T-0414

## Type
Task

## Parent
S-0411

## Summary
Add regression coverage for local CLI bootstrap, detectability, execution, and npm integration.

## Problem / Context
CLI tooling bootstrap changes repository mutation behavior and public discovery output, so it needs focused coverage.

## Goals
- Cover full bootstrap from an empty SpecForge metadata directory.
- Cover partial install repair.
- Execute the vendored runtime against a temp repository.
- Cover safe npm script injection.

## Non-goals
- End-to-end tests for future upgrade flows.

## Requirements
- [ ] R1: Tests assert created CLI artifact paths.
- [ ] R2: Tests assert discovery `cliTooling` output.
- [ ] R3: Tests execute parse, compose, and validate through the bootstrapped runtime.
- [ ] R4: Tests assert npm script preservation behavior.

## Acceptance Criteria
- [ ] AC1: The full Node test suite passes.
- [ ] AC2: Existing parse, compose, validate, API, and adapter regressions remain green.

## Dependencies
- T-0411
- T-0412
- T-0413

## Open Questions
- None

## Notes
This task protects both new behavior and bootstrap idempotency.
