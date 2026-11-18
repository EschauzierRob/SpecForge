# Distinguish and Filter Board Item Types

## ID
S-0203

## Type
Story

## Parent
F-0028

## Summary
As a planner, I can recognize item types at a glance and choose which types appear, starting with Features and Stories.

## Problem / Context
Uniform cards obscure planning levels, while Epic and Task cards make the default Board unnecessarily busy.

## Goals
- Provide a focused default and explicit access to every type.
- Keep type recognition accessible in selected and blocked states.

## Non-goals
- Persisting type filters in the URL, browser storage, or server state.
- Adding tag filtering as part of this extension.

## Requirements
- [ ] R1: Offer four labeled, independently selectable type controls, initially Feature and Story enabled and Epic and Task disabled.
- [ ] R2: Combine type selection with existing blocked-only and has-dependencies filters using AND semantics without reloading data.
- [ ] R3: Give every card a type label and a type-specific non-color cue, such as border treatment or labeled icon, alongside its ID and title.
- [ ] R4: Retain filter changes during the current Board visit, including opening or closing details and refreshing loaded data; reset on leaving and re-entering Board, switching repository, or page reload.
- [ ] R5: Allow all types to be deselected and show a clear no-matching-items state without changing the user's selections.

## Acceptance Criteria
- [ ] AC1: Initial and subsequent Board visits start with Feature and Story selected; toggling each type changes only matching card visibility.
- [ ] AC2: All sixteen type combinations work with both existing quick filters, including the empty type selection.
- [ ] AC3: Each type remains identifiable without color and when selected or blocked; existing badges remain readable.
- [ ] AC4: Controls are labeled, keyboard-operable, and expose their checked state; filter changes preserve existing item selection without forcing hidden cards back into view.

## Dependencies
- F-0008

## Open Questions
- None

## Notes
Board-local state is sufficient. Existing workspace URL parameters and public API contracts do not change.
