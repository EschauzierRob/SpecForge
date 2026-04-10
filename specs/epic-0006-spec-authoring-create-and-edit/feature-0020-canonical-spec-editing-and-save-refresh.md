# Canonical Spec Editing and Save Refresh

## ID
F-0020

## Type
Feature

## Parent
E-0006

## Summary
Allow users to edit existing canonical specs safely, persist those changes back to markdown, and refresh the workspace immediately after save.

## Problem / Context
Creating new specs is not sufficient if existing specs still require manual file edits. The epic needs an explicit slice for safe canonical editing and post-save workspace refresh.

## Goals
- Support structured editing of existing canonical spec fields.
- Save edits back to markdown without corrupting canonical structure.
- Refresh tree/detail/search surfaces immediately after save.

## Non-goals
- Free-form markdown editing of the entire file body.
- Editing multiple unrelated artifacts in one unreviewed transaction.

## Requirements
- [ ] R1: Users can open an existing canonical spec for editing and modify supported fields such as title, summary, requirements, acceptance criteria, notes, and semantic dependencies.
- [ ] R2: Save flow preserves canonical structure and does not silently discard unsupported content outside the supported editing boundary.
- [ ] R3: After a successful save, the workspace reloads or refreshes so the updated artifact is visible immediately in the UI.
- [ ] R4: Save failures surface actionable error messages without leaving the workspace in an ambiguous state.

## Acceptance Criteria
- [ ] AC1: Editing an existing spec updates the saved markdown for the selected artifact.
- [ ] AC2: The updated artifact is visible in tree/detail views without requiring a manual restart.
- [ ] AC3: Failed saves do not leave the user uncertain about whether the file changed.

## Dependencies
- F-0005
- F-0009
- F-0019

## Open Questions
- Should unsupported sections be preserved verbatim during save, or exposed as read-only until round-tripping is fully defined?

## Notes
This feature covers the structured edit path after canonical artifacts already exist.
