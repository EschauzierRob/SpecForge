# Review Write Impact Before Persisting Spec Changes

## ID
S-0608

## Type
Story

## Parent
F-0021

## Summary
As a product author, I can review the write target and hierarchy impact before save so canonical changes remain explicit and trustworthy.

## Problem / Context
Canonical writes can create or modify important source-of-truth files. Users need a final review step that shows what will change before the write happens.

## Goals
- Make pending file writes explicit before confirmation.
- Show target file path and affected artifact identity.
- Support safe confirmation for both create and edit flows.

## Non-goals
- Full git-style diff visualization for every markdown line in MVP.

## Requirements
- [ ] R1: Before save, the authoring flow shows the target artifact ID, type, and destination file path.
- [ ] R2: Create flows show whether a new file will be created; edit flows show which existing file will be updated.
- [ ] R3: Users must explicitly confirm the pending write after reviewing that summary.

## Acceptance Criteria
- [ ] AC1: Users can inspect the exact target file before save completes.
- [ ] AC2: Create and edit flows use distinct write-impact language appropriate to their mutation type.
- [ ] AC3: Unconfirmed writes do not change canonical files.

## Dependencies
- F-0021
- S-0604
- S-0606

## Open Questions
- Should the review step include a structured summary of changed sections in MVP, or only the affected file and artifact metadata?

## Notes
This story establishes an explicit confirmation layer around source-of-truth mutations.
