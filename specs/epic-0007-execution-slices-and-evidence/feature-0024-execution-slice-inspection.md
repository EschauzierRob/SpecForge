# Execution Slice Inspection

## ID
F-0024

## Type
Feature

## Parent
E-0007

## Summary
Expose execution slices through developer diagnostics and a focused read-only UI.

## Problem / Context
Slice data provides little operational value if it is only visible in raw overlay JSON.

## Goals
- Summarize slice counts in CLI diagnostics.
- Show slice lifecycle, scope, work, evidence, blockers, decisions, and next action in the UI.
- Navigate from slice-linked work to canonical detail.

## Non-goals
- Add slice editing.
- Add bundle views.

## Requirements
- [ ] R1: Compose and ingest results expose execution slices through their overlay files.
- [ ] R2: The UI presents active and historical slices without treating them as canonical hierarchy nodes.
- [ ] R3: Incidental work policy is visible in documentation.

## Acceptance Criteria
- [ ] AC1: CLI output reports execution slice counts.
- [ ] AC2: A Slices screen renders valid overlay slice data.
- [ ] AC3: Linked canonical work can be opened from the slice screen.

## Dependencies
- F-0023
- F-0009

## Open Questions
- None

## Notes
None
