# Specify Write Preview and Parent Reassignment Safeguards

## ID
T-0608

## Type
Task

## Parent
S-0608

## Summary
Define the review-before-save preview contract, including target file visibility and safeguards for parent changes that would relocate canonical artifacts.

## Problem / Context
Create and edit flows can both change where canonical artifacts live. Users need explicit preview and safeguards before those source-of-truth mutations occur.

## Goals
- Define the confirmation preview content.
- Clarify how create versus edit writes are described.
- Define special safeguards for parent changes that imply path relocation.

## Non-goals
- Full textual markdown diff generation in MVP.

## Requirements
- [ ] R1: The preview contract includes target artifact ID, type, path, and mutation mode (`create` or `update`).
- [ ] R2: Parent reassignment rules define when a path move is implied and how that is presented to the user before confirmation.
- [ ] R3: Unconfirmed preview states must not write or relocate canonical files.

## Acceptance Criteria
- [ ] AC1: The preview contract is clear enough to implement a final confirmation step without guessing which metadata to show.
- [ ] AC2: Parent-change safeguards are explicit enough to prevent silent file relocation.

## Dependencies
- S-0608
- T-0604
- T-0606

## Open Questions
- Should parent reassignment be out of scope for the first editable release if safe path moves are not yet ready?

## Notes
This task defines the final guardrail before canonical writes are committed.
