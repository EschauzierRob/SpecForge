# Canonical Spec Creation and Placement

## ID
F-0019

## Type
Feature

## Parent
E-0006

## Summary
Allow users to create new epic, feature, story, and task artifacts directly in SpecForge using canonical templates, valid parents, unique IDs, and correct file placement.

## Problem / Context
Direct spec authoring is a core promise of the epic, but the current decomposition does not yet cover the non-AI path for creating canonical artifacts with correct IDs and folder placement.

## Goals
- Support direct creation of canonical spec artifacts from the UI.
- Keep file naming and folder placement deterministic.
- Prevent duplicate IDs and invalid parent/type combinations during creation.

## Non-goals
- Editing overlay metadata.
- Auto-generating full spec content from AI prompts alone.

## Requirements
- [ ] R1: Users can start a create flow for Epic, Feature, Story, or Task from within SpecForge.
- [ ] R2: Creation uses the canonical template shape for the selected type and captures required fields before save.
- [ ] R3: The system suggests or assigns a unique ID and computes the correct destination path from the selected type and parent.
- [ ] R4: Invalid parent/type combinations are blocked before a file is written.

## Acceptance Criteria
- [ ] AC1: A user can create a new canonical artifact without manually creating the markdown file first.
- [ ] AC2: The saved artifact lands in the correct canonical folder with the expected filename pattern.
- [ ] AC3: Duplicate IDs and invalid parent selections are prevented during creation.

## Dependencies
- F-0001
- F-0004
- F-0014

## Open Questions
- Should epic creation always use a new `epic-####-slug/epic.md` folder, or should advanced users be allowed to target an existing empty epic folder?

## Notes
This feature covers the direct manual authoring path that complements AI-assisted seed expansion.
