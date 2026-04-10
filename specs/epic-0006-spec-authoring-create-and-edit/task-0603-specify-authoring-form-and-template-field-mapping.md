# Specify Authoring Form and Template Field Mapping

## ID
T-0603

## Type
Task

## Parent
S-0603

## Summary
Define how create forms map user-entered fields onto the canonical markdown templates for each spec type.

## Problem / Context
Create flows need an explicit mapping from structured form fields to canonical markdown sections to avoid template drift.

## Goals
- Define supported fields for each spec type.
- Map those fields to canonical markdown sections deterministically.
- Keep create flows aligned with repository templates.

## Non-goals
- Implementing the actual UI forms.

## Requirements
- [ ] R1: The mapping specifies which fields are required versus optional for Epic, Feature, Story, and Task.
- [ ] R2: Each supported field maps to an existing canonical markdown section without inventing new schema.
- [ ] R3: Empty optional fields are handled consistently in generated markdown.

## Acceptance Criteria
- [ ] AC1: An implementer can generate canonical markdown for each type from the documented field mapping alone.
- [ ] AC2: The mapping aligns with current templates under `specs/templates/`.

## Dependencies
- S-0603

## Open Questions
- Should optional empty sections be omitted entirely or retained as placeholders in first-save output?

## Notes
Documentation-focused task that de-risks canonical create-flow implementation.
