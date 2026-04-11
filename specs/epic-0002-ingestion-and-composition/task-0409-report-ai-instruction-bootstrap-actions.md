# Report AI Instruction Bootstrap Actions

## ID
T-0409

## Type
Task

## Parent
S-0403

## Summary
Report AI instruction files created by bootstrap through existing CLI and API bootstrap summaries.

## Problem / Context
Users need to see when bootstrap writes AI-facing workflow files into a repository.

## Goals
- Include created instruction docs in bootstrap action lists.
- Preserve the existing action contract.

## Non-goals
- Adding a new bootstrap action payload shape.

## Requirements
- [ ] R1: CLI bootstrap summaries include created AI instruction paths.
- [ ] R2: API bootstrap payloads include created AI instruction paths.

## Acceptance Criteria
- [ ] AC1: Programmatic clients can see created AI instruction files in `discovery.bootstrap.actions`.
- [ ] AC2: Human CLI output lists created AI instruction files.

## Dependencies
- S-0403
- T-0408

## Open Questions
- None

## Notes
No public contract change is expected because the existing file action shape is sufficient.
