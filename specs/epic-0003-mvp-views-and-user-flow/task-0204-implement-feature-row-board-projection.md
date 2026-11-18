# Implement Feature Row Board Projection

## ID
T-0204

## Type
Task

## Parent
S-0204

## Summary
Build and render a deterministic Feature-row Board projection from the full composed model.

## Problem / Context
The existing lane-only model cannot align related cards across columns or preserve parent context after filtering.

## Goals
- Separate relationship grouping from visible-card filtering.
- Retain status semantics and count cards accurately.

## Non-goals
- Canonical hierarchy inference changes or modifications to shared Overview status counts.

## Requirements
- [ ] R1: Add a pure Board projection that indexes composed nodes by ID, resolves type-valid direct parent chains, and groups Features, Stories, and optional Tasks according to S-0204.
- [ ] R2: Derive row context from the full model, apply card filters afterward, and return only nonempty rows plus an optional unresolved group. Guard invalid or cyclic chains without guessing relationships.
- [ ] R3: Preserve existing status order and fallback mapping, sort deterministically by spec ID, and expose Board-only visible-card column counts.
- [ ] R4: Render aligned status columns and labeled Feature rows with horizontal overflow on narrow screens; distinguish unloaded/empty data from no filter matches.

## Acceptance Criteria
- [ ] AC1: Projection regressions cover cross-status siblings, hidden Feature cards, childless Features, unresolved and wrong-type parents, invalid chains, deterministic ordering, and no duplicate cards.
- [ ] AC2: Visible-card counts equal rendered card totals after filtering, without changing Overview counts or parent statuses.
- [ ] AC3: Browser review at desktop width and 375 CSS pixels confirms accessible row labels, aligned columns, and reachable content without overlaps.

## Dependencies
- S-0204

## Open Questions
- None

## Notes
Extend the existing UI Board selectors and rendering rather than changing server contracts. The header progress slot is supplied by T-0205; optional parent actions and cards are completed by T-0206.
