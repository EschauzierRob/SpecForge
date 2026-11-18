# Implement Board Parent Context and Navigation

## ID
T-0206

## Type
Task

## Parent
S-0206

## Summary
Render optional Epic and Task cards, parent labels, and separate detail actions within the Feature-row Board.

## Problem / Context
Parent references must stay available when parent card types are hidden, and independent navigation cannot be nested inside an existing card button.

## Goals
- Preserve hierarchy context and existing drawer navigation for every visible type.

## Non-goals
- New detail routes, automatic filter changes, or canonical parent repairs.

## Requirements
- [ ] R1: Resolve type-valid Epic labels for Features and Story labels for Tasks using the full node index; show explicit unresolved or missing-parent context when resolution fails.
- [ ] R2: Render enabled Epics in an aligned section above Feature rows and enabled Tasks in their resolved Feature row or unresolved group, respecting all filters and counts.
- [ ] R3: Show Epic context on Feature cards and in surviving row labels when Feature cards are hidden; show direct Story context on Task cards.
- [ ] R4: Refactor card markup into a noninteractive container with separate card-selection and parent-navigation controls; reuse the existing onSelect flow to open details and synchronize item selection.
- [ ] R5: Provide visible focus and descriptive accessible labels; omit active parent controls for unresolved references and avoid event propagation that selects two items.

## Acceptance Criteria
- [ ] AC1: Fixtures verify Epic and Task placement, valid parent labels, missing-parent fallbacks, and no duplicate visible cards.
- [ ] AC2: Mouse and keyboard review confirms child and parent actions each open only the requested item, including hidden types, without resetting filters or introducing nested interactive controls.

## Dependencies
- S-0206

## Open Questions
- None

## Notes
Reuse the existing Board drawer and item URL synchronization. Parent navigation does not force the selected card to become visible.
