# Specify Editable Field Map and Round-Trip Boundaries

## ID
T-0605

## Type
Task

## Parent
S-0605

## Summary
Define which canonical fields are editable in-app and how saves preserve unsupported or out-of-scope markdown content.

## Problem / Context
Editing existing markdown safely requires clear round-trip boundaries so supported fields can change without accidental loss of unsupported content.

## Goals
- Define the supported editable field set.
- Clarify how markdown is re-serialized after edits.
- Protect unsupported content from silent loss.

## Non-goals
- Supporting arbitrary raw markdown editing in MVP.

## Requirements
- [ ] R1: The task lists which fields are editable for each spec type.
- [ ] R2: The save contract defines how unchanged supported fields and unsupported sections are preserved.
- [ ] R3: The contract documents any known non-round-trippable content that must remain read-only.

## Acceptance Criteria
- [ ] AC1: The editable-field boundary is precise enough to guide implementation and user messaging.
- [ ] AC2: Round-trip expectations are documented clearly enough to avoid accidental content loss.

## Dependencies
- S-0605

## Open Questions
- Should unsupported sections be preserved via structured passthrough metadata or raw markdown segment retention?

## Notes
This task de-risks safe canonical editing before implementation begins.
