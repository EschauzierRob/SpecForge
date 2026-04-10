# Report Bootstrap Actions in CLI/API

## ID
T-0405

## Type
Task

## Parent
S-0402

## Summary
Expose created artifacts in output summary.

## Problem / Context
Without reporting, users cannot tell whether the system mutated the workspace to restore operability.

## Goals
- Emit transparent bootstrap action summaries in CLI/API responses.

## Non-goals
- Building a full audit-history subsystem.

## Requirements
- [ ] R1: CLI output includes bootstrap action summary when artifacts are created.
- [ ] R2: API response model includes bootstrap action details.

## Acceptance Criteria
- [ ] AC1: Users can see created paths in CLI output.
- [ ] AC2: Programmatic clients can consume bootstrap action metadata from API responses.

## Dependencies
- S-0402
- T-0403

## Open Questions
- Should action reporting include "already existed" checks, or only created artifacts?

## Notes
Keep output concise but machine-parseable where applicable.
