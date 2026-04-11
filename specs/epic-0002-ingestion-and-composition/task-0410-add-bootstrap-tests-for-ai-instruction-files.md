# Add Bootstrap Tests for AI Instruction Files

## ID
T-0410

## Type
Task

## Parent
S-0403

## Summary
Add tests that verify bootstrap creates AI instruction files idempotently and conservatively.

## Problem / Context
Instruction bootstrap touches user-facing repository files and needs regression coverage against overwrites.

## Goals
- Cover missing instruction files.
- Cover existing root `AGENTS.md` preservation.
- Cover repeated bootstrap idempotency.

## Non-goals
- Testing every exact sentence of instruction copy.

## Requirements
- [ ] R1: Tests verify bootstrap creates AI instruction docs when missing.
- [ ] R2: Tests verify bootstrap does not overwrite existing root `AGENTS.md`.
- [ ] R3: Tests verify repeated bootstrap creates no additional artifacts.

## Acceptance Criteria
- [ ] AC1: Discovery, ingest, CLI, and API bootstrap tests account for AI instruction artifacts.
- [ ] AC2: A preservation test proves existing agent instructions remain unchanged.

## Dependencies
- S-0403
- T-0408
- T-0409

## Open Questions
- None

## Notes
Use temporary repositories so tests do not mutate checked-in fixtures.
