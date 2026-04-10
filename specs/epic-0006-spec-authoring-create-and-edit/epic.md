# Spec Authoring (Create & Edit)

## ID
E-0006

## Type
Epic

## Parent
None

## Summary
Enable users to create and edit spec artifacts (epics, features, stories, tasks) directly within SpecForge, while maintaining canonical structure and separation from planning metadata.

## Problem / Context
Currently:
- specs must be created manually in files
- structure consistency depends on discipline
- onboarding new work is slow and error-prone

## Goals
- allow structured creation of new specs
- enforce canonical schema
- reduce format drift
- integrate seamlessly with existing repos

## Non-goals
- editing overlay metadata (handled separately)
- full WYSIWYG editor for markdown (keep lightweight)

## Requirements
- [ ] R1: User can create Epic, Feature, Story, and Task artifacts that follow canonical schema, receive a unique ID, and are placed in the correct folder.
- [ ] R2: User can edit title, description, requirements, acceptance criteria, and optional semantic dependencies.
- [ ] R3: IDs follow a consistent pattern (`epic-XXXX`, `feature-XXXX`, `story-XXXX`, `task-XXXX`) and duplicates are prevented.
- [ ] R4: User selects or confirms parent assignment and the system enforces valid hierarchy (Feature → Epic, Story → Feature, Task → Story).
- [ ] R5: New specs use templates, are saved to the correct directory, and are immediately available in the UI.
- [ ] R6: Required fields are validated before save, and missing fields block creation.

## Acceptance Criteria
- [ ] AC1: User can create a new feature from the UI.
- [ ] AC2: Resulting file is valid and correctly placed.
- [ ] AC3: Spec appears immediately in tree view.
- [ ] AC4: Structure remains consistent across repository.

## Dependencies
- E-0001
- E-0002
- E-0003
- E-0004

## Open Questions
- Should ID generation always be automatic, or should users be able to override suggested IDs with validation?
- Should edit flows support batched multi-file changes, or be limited to single-artifact transactions initially?

## Notes
This epic introduces controlled write capabilities for canonical spec artifacts while explicitly keeping planning overlay mutation out of scope.
