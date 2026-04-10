# Create Canonical Spec from Template

## ID
S-0603

## Type
Story

## Parent
F-0019

## Summary
As a product author, I can start a new canonical spec from the correct template so I do not have to hand-author the markdown scaffold.

## Problem / Context
Manual file creation is slow and increases the chance of missing required sections or using the wrong structure for the selected spec type.

## Goals
- Start new canonical artifacts from the correct template.
- Capture required fields before save.
- Keep authoring focused on structured fields instead of raw markdown setup.

## Non-goals
- Generating content automatically from AI without user input.

## Requirements
- [ ] R1: User can choose the target artifact type: Epic, Feature, Story, or Task.
- [ ] R2: The create flow presents the required and supported optional fields for that type based on the canonical template.
- [ ] R3: Saving the draft writes a canonical markdown file with the correct section structure.

## Acceptance Criteria
- [ ] AC1: Starting a new artifact creates a structured draft without manual file scaffolding.
- [ ] AC2: The saved markdown includes the expected sections for the chosen type.
- [ ] AC3: Required sections are present in the resulting file structure.

## Dependencies
- F-0019

## Open Questions
- Should the first version show a single generic authoring form that adapts by type, or type-specific forms with tailored copy?

## Notes
This story covers the initial create-draft experience for canonical artifacts.
