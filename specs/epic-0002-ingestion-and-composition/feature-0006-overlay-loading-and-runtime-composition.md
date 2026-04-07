# Overlay Loading and Runtime Composition

## ID
F-0006

## Type
Feature

## Parent
E-0002

## Summary
Load overlay metadata and compose it with canonical nodes to create runtime models used by views and ranking logic.

## Problem / Context
Planning signals must be available at runtime without mutating source specs.

## Goals
- Load overlay JSON according to documented schema.
- Compose metadata onto canonical entities by ID.
- Emit diagnostics for unresolved references.

## Non-goals
- Editing overlay content.

## Requirements
- [ ] R1: Overlay loader validates basic schema and entry types.
- [ ] R2: Composer attaches overlay facets non-destructively.
- [ ] R3: Unknown spec IDs are surfaced as warnings.

## Acceptance Criteria
- [ ] AC1: Composed node exposes both spec fields and overlay fields.
- [ ] AC2: Missing overlay entries do not block composition.
- [ ] AC3: Composition report includes unresolved overlay reference count.

## Dependencies
- F-0002
- F-0005

## Open Questions
- What precedence rules should apply when multiple overlay files target same specId?

## Notes
Runtime model should preserve explainability for every composed field.
