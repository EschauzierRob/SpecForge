# Specify Authoring Validation Rules and Error Presentation

## ID
T-0607

## Type
Task

## Parent
S-0607

## Summary
Define the validation rules that run inside authoring flows and how blocking errors are presented before save.

## Problem / Context
Canonical validation exists conceptually, but authoring flows need a focused pre-save rule set and clear UX for blocking conditions.

## Goals
- Reuse canonical validation concepts in authoring.
- Distinguish blocking errors from optional future warnings.
- Define actionable error presentation for users.

## Non-goals
- Replacing repository-wide validation after save.

## Requirements
- [ ] R1: The validation set covers required fields, hierarchy constraints, ID format, duplicate detection, and path rules.
- [ ] R2: Blocking errors include precise field- or relationship-level remediation guidance.
- [ ] R3: The task defines how errors are surfaced in create and edit flows before write confirmation.

## Acceptance Criteria
- [ ] AC1: Implementers can tell which conditions must block save versus which can remain future warning-only behavior.
- [ ] AC2: Error messaging guidance is concrete enough to keep users from guessing what to fix.

## Dependencies
- S-0607

## Open Questions
- Should semantic-dependency validation be blocking during authoring, or deferred to repository-wide validation in MVP?

## Notes
This task narrows repository validation concepts into authoring-time safeguards.
