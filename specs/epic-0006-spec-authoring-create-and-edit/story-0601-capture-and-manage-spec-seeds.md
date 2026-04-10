# Capture and Manage Spec Seeds

## ID
S-0601

## Type
Story

## Parent
F-0018

## Summary
As a product author, I can quickly create and update Spec Seeds so early ideas are captured in-system before full specification work.

## Problem / Context
Early concepts are often lost across chats and notes. Without a first-class seed artifact, teams delay recording intent until full specs are ready.

## Goals
- Enable low-friction capture of initial feature ideas.
- Keep seeds distinct from canonical specs.
- Track progression from not-started to expanded.

## Non-goals
- Full canonical spec editing from seed forms.

## Requirements
- [ ] R1: Seed creation requires title and short description, with optional context.
- [ ] R2: Seed IDs are unique and seed records persist in a dedicated seed storage location.
- [ ] R3: Seed metadata includes expansion status (`not-started` or `expanded`).
- [ ] R4: Users can edit seed content and re-save without converting to canonical specs.

## Acceptance Criteria
- [ ] AC1: Creating a seed does not create files under `/specs`.
- [ ] AC2: Seed list/detail views can display seed title, ID, and expansion status.
- [ ] AC3: Updating seed text keeps the same seed ID and auditably changes the content used for future expansion.

## Dependencies
- F-0004
- F-0014

## Open Questions
- Should seeds support soft-delete/archive in the first version?

## Notes
This story establishes the seed artifact lifecycle before AI-assisted expansion.
