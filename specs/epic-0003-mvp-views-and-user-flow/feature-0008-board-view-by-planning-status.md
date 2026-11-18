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
- [ ] R4: Features and Stories are selected by default; Epics and Tasks can be enabled independently through type filters as specified by F-0028.

## Acceptance Criteria
- [ ] AC1: Each status-column count equals the number of visible cards matching all active Board filters; contextual row headers do not count as cards.
- [ ] AC2: Blocked items are visibly distinguishable.
- [ ] AC3: Filtering updates lane contents without data reload.

## Dependencies
- F-0006
- F-0007

## Open Questions
- None

## Notes
Board is read-only representation of overlay state.
F-0028 defines Feature rows, type distinctions, parent context, and child progress. Epics and Tasks are hidden by default.
