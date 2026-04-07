# Board View by Planning Status

## ID
F-0008

## Type
Feature

## Parent
E-0003

## Summary
Render composed work items in status-grouped lanes to support planning conversations.

## Problem / Context
Hierarchy alone does not reveal immediate execution distribution and bottlenecks.

## Goals
- Group relevant items by planningStatus.
- Support basic filtering by type and tags.

## Non-goals
- Drag-and-drop state editing in MVP.

## Requirements
- [ ] R1: Board lanes represent supported planningStatus values.
- [ ] R2: Items with missing status appear in a clear fallback lane.
- [ ] R3: Filters can narrow visible items by type and tag.

## Acceptance Criteria
- [ ] AC1: Board counts match composed model counts by status.
- [ ] AC2: Blocked items are visibly distinguishable.
- [ ] AC3: Filtering updates lane contents without data reload.

## Dependencies
- F-0006
- F-0007

## Open Questions
- Should epics be hidden by default from board lanes in MVP?

## Notes
Board is read-only representation of overlay state.
