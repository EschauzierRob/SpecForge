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
- Surface the next story-sized implementation slice, not the parent epic or feature container.
- Explain which epic/feature priority path caused a story to rank highly.

## Non-goals
- Team allocation or sprint simulation.

## Requirements
- [ ] R1: Only actionable items are considered.
- [ ] R2: Ranking rationale is visible per item.
- [ ] R3: Epics and features with unfinished descendants are suppressed from the direct recommendation list.
- [ ] R4: Recommended story items inherit priority and unresolved blockers from their ancestor epic/feature path.

## Acceptance Criteria
- [ ] AC1: Recommendation list excludes done and blocked items.
- [ ] AC2: Items with unmet dependencies are not marked actionable.
- [ ] AC3: A story under the highest-priority feature appears before the containing epic/feature.
- [ ] AC4: Parent-child references in dependency lists do not block a child from being recommended.

## Dependencies
- F-0012

## Open Questions
- Should a future view let users switch the recommendation unit between feature, story, and task?

## Notes
This story is the user-facing behavior target for ranking engine output. Default output is story-first because stories are the smallest planning unit that is usually meaningful to finish directly.
