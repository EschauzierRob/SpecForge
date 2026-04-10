# Edit Existing Canonical Spec Fields

## ID
S-0605

## Type
Story

## Parent
F-0020

## Summary
As a product author, I can edit supported fields on an existing canonical spec so I can refine requirements without leaving SpecForge.

## Problem / Context
Once specs exist, authors still need a safe in-app way to refine titles, summaries, requirements, acceptance criteria, and dependencies.

## Goals
- Support structured editing of existing canonical fields.
- Keep users inside SpecForge for common refinement work.
- Preserve canonical markdown integrity while editing.

## Non-goals
- Unbounded rich-text or WYSIWYG editing of every markdown nuance.

## Requirements
- [ ] R1: Editing supports the canonical fields most likely to change during refinement, including title, summary, requirements, acceptance criteria, notes, and semantic dependencies where applicable.
- [ ] R2: Existing spec content is loaded into an editable form without requiring users to re-enter unchanged fields.
- [ ] R3: Save writes the edited values back into canonical markdown for the selected artifact only.

## Acceptance Criteria
- [ ] AC1: A user can open an existing feature, story, or task and change supported fields.
- [ ] AC2: Unchanged supported fields remain intact after save.
- [ ] AC3: The saved spec can still be parsed by the existing canonical ingestion pipeline.

## Dependencies
- F-0020

## Open Questions
- Should epic editing support the same field set as lower-level artifacts in the first version, or a smaller MVP subset?

## Notes
This story focuses on the edit form and supported field surface, not on refresh behavior after save.
