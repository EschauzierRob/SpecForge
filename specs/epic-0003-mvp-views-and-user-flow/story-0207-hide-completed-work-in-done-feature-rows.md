# Hide Completed Work in Done Feature Rows

## ID
S-0207

## Type
Story

## Parent
F-0028

## Summary
As a planner, I see open work and completed children of ongoing Features by default, and can optionally include completed cards within completed Features.

## Problem / Context
Completely finished Feature rows distract from ongoing work. Hiding every done card would also remove useful completed Stories and Tasks within ongoing Features, while hiding entire done Feature rows would conceal any remaining open children.

## Goals
- Reduce completed-work clutter without concealing unfinished children.
- Preserve completed child context for Features that are still ongoing.

## Non-goals
- Hiding the Done column or automatically deriving Feature status from children.
- Filtering standalone Epic cards or items without a resolvable Feature through this new rule.
- Persisting the checkbox in URLs, browser storage, or server state.

## Requirements
- [ ] R1: Add a keyboard-operable, labeled checkbox Show done in completed Features to the Board quick filters, initially unchecked.
- [ ] R2: When unchecked, hide a card only if both that card and its owning Feature have explicit overlay planningStatus done. The owning Feature of a Feature card is itself; Stories resolve their direct Feature and Tasks resolve their Story's direct Feature from the complete composed model.
- [ ] R3: Keep non-done cards of a done Feature eligible for display even when their Story or Feature card is hidden. Keep the Feature row header and parent context whenever the row has a visible card.
- [ ] R4: Keep done cards under Features with any other or missing status eligible for display. Missing card status is not done; blocked metadata does not override explicit done status.
- [ ] R5: When checked, remove only this additional exclusion. All type and existing quick filters still apply using AND semantics, without reloading repository data.
- [ ] R6: Keep the Done column visible, derive column counts from visible cards, and omit rows without matching cards. A fully done Board may display the existing no-matches state.
- [ ] R7: Preserve child-progress calculations over all direct children, existing selection, and detail navigation. Toggling the checkbox must not force a hidden selected card back into view or change explicit statuses.
- [ ] R8: Retain the checkbox value during details and composed-data refresh; reset it to unchecked on leaving and re-entering Board, switching repository, or page reload, matching the existing Board filter lifecycle.
- [ ] R9: Apply no additional exclusion to Epic cards or cards whose Feature cannot be resolved through type-valid parent links. Do not infer missing relationships to decide visibility.

## Acceptance Criteria
- [ ] AC1: By default, a done Feature with only done Stories and Tasks has no visible cards or row. Enabling the checkbox restores cards matching the other active filters.
- [ ] AC2: A done Feature containing both done and open children hides its own card and its done children but retains open children and the Feature row context. An open Task remains eligible even when its direct Story is done and hidden.
- [ ] AC3: Done Stories and Tasks remain eligible under a Feature whose status is ready, backlog, in_progress, blocked, or missing. An item without status remains eligible under a done Feature.
- [ ] AC4: The Done column remains present and its count matches visible done cards. Story Task counts and Feature Story counts do not change when the checkbox is toggled, including counts of hidden completed children.
- [ ] AC5: Type and quick-filter combinations behave consistently with both checkbox states, including an empty result. Standalone done Epics and done items with unresolved Feature membership are not excluded by this checkbox.
- [ ] AC6: Mouse and keyboard activation expose the checked state correctly; opening details and refreshing data retain it, while Board re-entry, repository switch, and page reload restore the unchecked default.

## Dependencies
- S-0204
- S-0205

## Open Questions
- None

## Notes
This is not a global hide-done filter. A Feature's explicit done status scopes the exclusion; it does not assert that every child has completed. Existing filters can still hide cards described here as eligible.
