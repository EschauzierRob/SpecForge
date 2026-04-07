# Local Repository Loading

## ID
F-0004

## Type
Feature

## Parent
E-0002

## Summary
Enable users to point SpecForge to a local repository path and load supported content for processing.

## Problem / Context
Spec-driven teams need local-first operation with minimal setup.

## Goals
- Support configurable local repository root.
- Discover expected spec and overlay directories.

## Non-goals
- Network cloning or auth workflows.

## Requirements
- [ ] R1: Accept local path input.
- [ ] R2: Verify path exists and is readable.
- [ ] R3: Discover files under `/specs` and `/specforge/overlay`.

## Acceptance Criteria
- [ ] AC1: Invalid paths return actionable error messages.
- [ ] AC2: Valid repositories produce a discovery summary.
- [ ] AC3: Discovery logic is deterministic across runs.

## Dependencies
- F-0003

## Open Questions
- Should hidden files be ignored by default?

## Notes
Local-first behavior is non-negotiable for MVP.
