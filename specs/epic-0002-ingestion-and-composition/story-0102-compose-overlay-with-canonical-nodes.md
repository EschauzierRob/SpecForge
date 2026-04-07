# Compose Overlay with Canonical Nodes

## ID
S-0102

## Type
Story

## Parent
F-0006

## Summary
As a user, I need overlay metadata attached to spec nodes at runtime so planning views can show execution state without mutating specs.

## Problem / Context
Spec and planning data must coexist in views while remaining independently stored.

## Goals
- Merge by stable ID.
- Surface unresolved references.

## Non-goals
- Persist composed model.

## Requirements
- [ ] R1: For each canonical node, attach overlay facet when `specId` matches.
- [ ] R2: Collect warnings for overlay entries with unknown `specId`.

## Acceptance Criteria
- [ ] AC1: Composed object retains original canonical fields unchanged.
- [ ] AC2: Composition summary includes unresolved overlay references.

## Dependencies
- F-0006

## Open Questions
- Should composed facet include source overlay file path metadata?

## Notes
Composition is a runtime projection only.
