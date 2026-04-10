# Authoring Validation and Safe Write Guardrails

## ID
F-0021

## Type
Feature

## Parent
E-0006

## Summary
Enforce required-field, hierarchy, and write-safety guardrails across create and edit flows before canonical markdown is persisted.

## Problem / Context
Authoring flows become risky if invalid hierarchy, missing required sections, or unexpected write impact are only discovered after save. The epic needs a dedicated guardrail slice.

## Goals
- Block invalid authoring states before write.
- Reuse canonical validation concepts inside create/edit flows.
- Make pending write impact visible before the user confirms persistence.

## Non-goals
- Auto-correcting invalid user input without review.
- Replacing repository-wide validation with only form-level checks.

## Requirements
- [ ] R1: Authoring flows validate required fields, hierarchy rules, and ID/path constraints before save.
- [ ] R2: Validation errors explain what is wrong and what must change before write can continue.
- [ ] R3: Users can review intended file targets and hierarchy impact before confirming a write.
- [ ] R4: Guardrails apply consistently to both create and edit workflows.

## Acceptance Criteria
- [ ] AC1: Missing required fields block save with specific remediation guidance.
- [ ] AC2: Invalid parent assignments are rejected before markdown files are written.
- [ ] AC3: Users can inspect which canonical artifact will be created or updated before confirming the write.

## Dependencies
- F-0010
- F-0019
- F-0020

## Open Questions
- Should authoring guardrails surface only blocking errors in MVP, or also non-blocking warnings for risky but legal edits?

## Notes
This feature turns canonical authoring into a constrained, reviewable write workflow rather than a blind file mutation path.
