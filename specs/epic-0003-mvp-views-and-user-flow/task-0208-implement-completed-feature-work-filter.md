# Implement Completed Feature Work Filter

## ID
T-0208

## Type
Task

## Parent
S-0207

## Summary
Add a default-off completed-Feature work checkbox and a hierarchy-aware visibility rule, with regression coverage for child retention, progress, and filter combinations.

## Problem / Context
The existing Board filters inspect individual card metadata, but this exclusion depends on the card's owning Feature as well as its own status. It must use the full hierarchy before card filtering so hidden parents do not conceal open descendants.

## Goals
- Implement the agreed visibility predicate within the existing Board projection.
- Verify that row context, counts, progress, and filter lifecycle remain consistent.

## Non-goals
- New API endpoints, canonical fields, URL parameters, or changes to existing status mapping.
- Reopening SL-0004 or altering its recorded evidence.

## Requirements
- [ ] R1: Extend the Board filter state with showDoneInCompletedFeatures, default false in the filter factory. Treat an omitted value as false so the new default applies consistently to existing callers.
- [ ] R2: In the Board projection, resolve each Feature, Story, and Task's owning Feature using the complete type-checked node index. Exclude the card only when the checkbox is false and both its status and its owning Feature's status are done; retain unresolved memberships without guessing.
- [ ] R3: Add the labeled Show done in completed Features checkbox beside the existing quick filters, using the same Board-local state and reset boundary. Combine the predicate with existing filters before visible-card counts and empty-row removal, without filtering the source used for progress.
- [ ] R4: Preserve the existing Done column, parent context for surviving children, drawer and selected-item behavior, source immutability, and explicit statuses.
- [ ] R5: Extend the maintained Board tests with completed, ongoing, and missing-status Features, mixed child statuses, an open Task under a hidden done Story, done items with blocked metadata, and unavailable or wrong-type parent links. Verify both checkbox states across all sixteen type selections and four existing quick-filter combinations.
- [ ] R6: Review checkbox mouse/keyboard operation, selection preservation, data-refresh behavior, and filter reset on Board re-entry, repository switch, and reload. Run the UI production build, relevant regressions, full test suite, and SpecForge parse, compose, and validate checks; record actual results and any proven pre-existing failures in the new implementation slice.

## Acceptance Criteria
- [ ] AC1: Automated tests establish S-0207's default behavior, restoration when enabled, retention of open descendants and completed children of ongoing Features, and fallback behavior for missing statuses or unresolved relationships.
- [ ] AC2: Both checkbox states pass all 64 type/quick-filter combinations with exact visible-card counts, no duplicate cards, correct empty-row removal, unchanged direct-child progress, and no source mutation.
- [ ] AC3: Browser review confirms an always-present Done column, accessible checkbox operation, preserved details/selection, refresh retention, and the specified reset behavior without requiring a repository reload when toggling.
- [ ] AC4: Build and repository checks pass, or a demonstrably pre-existing unrelated test failure is explicitly documented without declaring that run passed; any introduced failure is resolved.

## Dependencies
- S-0207

## Open Questions
- None

## Notes
The hierarchy-aware condition belongs in the Board projection where the full node index is available; a status-only predicate would incorrectly hide completed children of ongoing Features. Start a new execution slice before implementing and baseline its required evidence; this specification does not claim implementation or test completion.
