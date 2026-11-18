# Group Board Cards into Feature Rows

## ID
S-0204

## Type
Story

## Parent
F-0028

## Summary
As a planner, I can scan a Feature and its Stories across status columns in one clearly labeled horizontal row.

## Problem / Context
Flat status columns separate related cards without communicating their shared Feature. Nesting Stories inside the Feature card would hide their own status positions.

## Goals
- Show parent-child membership and status simultaneously.
- Keep every visible card represented exactly once.

## Non-goals
- Nested Story cards, connecting lines, collapsible rows, or a separate Story Board.
- Changing the current mapping of planning statuses to columns.

## Requirements
- [ ] R1: Render a stable Feature row with an always-visible row label containing Feature ID, title, and Story completion as defined by S-0205.
- [ ] R2: Place the Feature card in its own status column and direct Story cards in their respective columns within the same row. Optional Tasks follow S-0206.
- [ ] R3: Build relationships from the complete composed model before filtering cards. Filtering out a Feature card does not remove matching descendants or their row label.
- [ ] R4: Keep only rows with at least one matching visible card. Count visible cards once per status column across all rows and the optional Epic section, excluding row labels.
- [ ] R5: Preserve the existing Unplanned, Backlog, Ready, In Progress, Done order, including blocked-status mapping to In Progress and missing-status mapping to Unplanned.
- [ ] R6: Retain items with missing, wrong-type, or cyclic parent chains in a labeled Unassigned / unresolved hierarchy group rather than dropping or guessing their membership. A Feature itself still anchors its own row when its Epic cannot be resolved.
- [ ] R7: Order Feature rows by Feature ID and cards within a row-column by spec ID, with the unresolved group after valid Feature rows. Keep shared status-column alignment and readable row labels on narrow screens using horizontal scrolling when needed.

## Acceptance Criteria
- [ ] AC1: A Ready Feature with Backlog, In Progress, and Done Stories appears in one row with all four cards in their own columns.
- [ ] AC2: With only Stories selected, matching Stories retain their Feature row context without showing or counting a Feature card; a Feature with no visible matching cards has no row.
- [ ] AC3: Column counts match rendered cards after every filter change, including Epic and Task visibility; no card appears twice.
- [ ] AC4: Stories without a resolvable direct Feature and Tasks without a valid Story-to-Feature chain remain visible when selected, in the unresolved group with their available parent references.
- [ ] AC5: Empty data and no matching cards have distinct readable empty states. At a 375 CSS-pixel viewport, scrolling allows access to all columns and row context without overlapping cards or controls.

## Dependencies
- S-0203

## Open Questions
- None

## Notes
Context labels are not additional cards and do not inherit or alter planning status. A Feature's missing Epic is presented through S-0206 rather than preventing its Story grouping.
