# Show Board Parent Context and Optional Types

## ID
S-0206

## Type
Story

## Parent
F-0028

## Summary
As a planner, I can identify a Feature's Epic, inspect optional Epic and Task cards, and navigate related items without leaving the Board.

## Problem / Context
Hiding Epics and Tasks should reduce clutter while retaining parent context and optional access to the full hierarchy.

## Goals
- Keep Epic and Story parent references readable and actionable.
- Add optional types without flattening Feature rows.

## Non-goals
- Automatically changing type filters when following a parent link.
- Repairing invalid canonical hierarchy from the Board.

## Requirements
- [ ] R1: Feature cards show their Epic ID and title. When a Feature card is filtered out, its visible row label also shows that Epic context.
- [ ] R2: Enabled Epic cards appear once in a labeled Epics section above Feature rows, aligned to the existing status columns and filtered by the same controls.
- [ ] R3: Enabled Task cards appear in their Story's Feature row and their own status column, with direct Story ID and title; invalid chains use S-0204's unresolved group.
- [ ] R4: Card actions select that item and open the existing Board detail drawer. Available Epic and Story references offer separate actions that select and open the referenced item, even when its card type is hidden.
- [ ] R5: Render card actions and parent actions as separate keyboard-operable controls with visible focus, without nested interactive elements or accidental double selection.
- [ ] R6: For an unavailable or wrong-type parent, show the available parent ID with an unresolved-context label and no active parent action; if no parent ID exists, show an explicit missing-parent label.
- [ ] R7: Opening details preserves Board layout and filters, the existing selected-item URL behavior, and the selected styling when that item's card is visible.

## Acceptance Criteria
- [ ] AC1: With Epics hidden, a Feature still identifies its Epic; hiding Feature cards leaves Epic context in any surviving row label.
- [ ] AC2: Enabling Epics and Tasks preserves Feature rows, displays each matching card exactly once, and shows Task-to-Story references.
- [ ] AC3: Mouse and keyboard activation of a parent action opens that parent's details without also selecting the child or enabling hidden card types.
- [ ] AC4: Missing Epic and Story nodes show readable unresolved references without broken navigation; opening and closing details retains active filters.

## Dependencies
- S-0204
- F-0009

## Open Questions
- None

## Notes
Use the existing selection and detail callbacks. Parent references are navigation context, not extra Board cards or new workspace URL fields.
