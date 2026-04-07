# Produce Recommended Next Work List

## ID
S-0302

## Type
Story

## Parent
F-0012

## Summary
As a planning user, I need a ranked list of actionable work so I can confidently pick the next implementation slice.

## Problem / Context
Backlogs often contain many items, but only a subset is truly actionable at any time.

## Goals
- Turn composed overlay signals into ranked recommendations.

## Non-goals
- Team allocation or sprint simulation.

## Requirements
- [ ] R1: Only actionable items are considered.
- [ ] R2: Ranking rationale is visible per item.

## Acceptance Criteria
- [ ] AC1: Recommendation list excludes done and blocked items.
- [ ] AC2: Items with unmet dependencies are not marked actionable.

## Dependencies
- F-0012

## Open Questions
- Should epics/features ever appear in recommendations?

## Notes
This story is the user-facing behavior target for ranking engine output.
