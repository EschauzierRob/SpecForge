# Board Hierarchy and Progress

## ID
F-0028

## Type
Feature

## Parent
E-0003

## Summary
Make Feature and Story relationships immediately readable on the planning Board through Feature rows, distinct card types, parent context, and child progress.

## Problem / Context
Epics, Features, Stories, and Tasks currently appear as nearly identical cards in flat status columns. Users cannot readily see which work belongs together or assess Story progress without opening individual items.

## Goals
- Make Features and Stories the primary planning items.
- Preserve status visibility while showing hierarchy directly on the Board.
- Expose Epic context and direct-child completion without opening details.

## Non-goals
- Drag-and-drop, editing, automatic parent-status roll-up, or collapsible rows.
- New API endpoints, canonical fields, or persisted Board filter settings.
- Redesigning Tree, Detail, or the underlying hierarchy inference rules.

## Requirements
- [ ] R1: Independently filter all four canonical types, with only Features and Stories selected on each Board entry.
- [ ] R2: Distinguish card types through readable labels and visual treatment that does not depend on color alone.
- [ ] R3: Render one horizontal row per Feature across existing status columns, with each visible card in its own status column.
- [ ] R4: Show direct-Story completion in Feature row headers and direct-Task completion on Story cards, independent of display filters.
- [ ] R5: Show Epic ID and title on Feature cards and in row context when Feature cards are filtered out.
- [ ] R6: Support optional Epic and Task cards, missing-parent fallback groups, and existing detail navigation without duplicating cards.
- [ ] R7: Preserve existing status mapping, blocked and dependency indicators, selection, and quick filters; count only visible cards in each status column.

## Acceptance Criteria
- [ ] AC1: Opening the Board shows Feature and Story cards grouped by Feature; Epic and Task cards appear only after their types are enabled.
- [ ] AC2: A Feature and its Stories with different statuses share a row while retaining their individual status-column positions.
- [ ] AC3: A Story with five direct Tasks, three with overlay status done, displays Tasks: 3/5 complete even when those Tasks are hidden or excluded by quick filters.
- [ ] AC4: Users can identify a Feature's Epic and a visible Task's Story and open available referenced items in the existing detail drawer.
- [ ] AC5: Missing parents, empty selections, keyboard navigation, and narrow screens remain usable under the child Story criteria.

## Dependencies
- F-0008
- F-0009

## Open Questions
- None

## Notes
Use the existing composed nodes and their direct parent IDs. Canonical hierarchy remains Epic -> Feature -> Story -> Task. The Board is a read-only projection; exact colors and spacing follow the existing UI style.
