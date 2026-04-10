# Block Invalid Authoring States Before Save

## ID
S-0607

## Type
Story

## Parent
F-0021

## Summary
As a product author, I want invalid authoring states blocked before save so malformed canonical specs are not written accidentally.

## Problem / Context
Authoring flows that only validate after file write risk introducing broken hierarchy, missing required sections, or invalid IDs into the repository.

## Goals
- Validate required fields before write.
- Enforce hierarchy and ID constraints during authoring.
- Reuse canonical validation concepts in the write path.

## Non-goals
- Auto-fixing invalid content without user review.

## Requirements
- [ ] R1: Authoring validation checks required fields for the selected artifact type before save.
- [ ] R2: Hierarchy constraints reject invalid parent/type combinations during create and edit flows.
- [ ] R3: ID and path validation reject malformed or duplicate destinations before write.

## Acceptance Criteria
- [ ] AC1: Missing required fields block save with specific messages.
- [ ] AC2: Invalid parent assignments cannot be confirmed.
- [ ] AC3: Duplicate or malformed IDs are rejected before disk mutation occurs.

## Dependencies
- F-0021
- F-0019
- F-0020

## Open Questions
- Should validation messages be grouped by section, by severity, or by save step in the first version?

## Notes
This story brings canonical validation rules into the authoring workflow itself.
