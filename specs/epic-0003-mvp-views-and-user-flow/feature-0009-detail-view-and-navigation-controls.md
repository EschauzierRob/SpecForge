# Detail View and Navigation Controls

## ID
F-0009

## Type
Feature

## Parent
E-0003

## Summary
Provide a detail panel that displays source spec content, overlay metadata, lineage, and dependencies for the selected item.

## Problem / Context
Users need a single inspection pane to understand context before taking action.

## Goals
- Show key spec fields and acceptance criteria.
- Show overlay metadata and diagnostic hints.
- Provide basic navigation shortcuts (parent, children, dependencies).

## Non-goals
- Rich text spec editing.

## Requirements
- [ ] R1: Detail panel displays canonical fields from selected node.
- [ ] R2: Detail panel displays overlay fields if present.
- [ ] R3: Navigation controls jump to linked items.

## Acceptance Criteria
- [ ] AC1: Selecting any node updates detail panel in under expected UI threshold.
- [ ] AC2: Missing overlay fields are represented as “not set,” not errors.
- [ ] AC3: Dependency links are clickable and resolve if targets exist.

## Dependencies
- F-0007
- F-0008

## Open Questions
- Should raw markdown excerpt be shown in MVP detail panel?

## Notes
Panel should prioritize clarity over density.
