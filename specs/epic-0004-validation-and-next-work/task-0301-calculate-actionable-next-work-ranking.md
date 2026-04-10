# Calculate Actionable Next Work Ranking

## ID
T-0301

## Type
Task

## Parent
S-0302

## Summary
Implement a deterministic ranking function that outputs recommended actionable items with rationale.

## Problem / Context
Teams need transparent prioritization from composed data.

## Goals
- Produce ranked story-first work-unit list and reason codes.
- Preserve priority-path context so recommendation consumers can explain ancestor boosts.

## Non-goals
- Capacity-aware scheduling.

## Requirements
- [ ] R1: Filter out done and blocked items.
- [ ] R2: Exclude items with unresolved dependencies.
- [ ] R3: Rank remaining items by rank and status heuristics.
- [ ] R4: Suppress epic/feature containers when unfinished child work exists.
- [ ] R5: Suppress tasks under unfinished story ancestors from the primary recommendation list.
- [ ] R6: Ignore dependency entries that point to an ancestor in the same hierarchy path.
- [ ] R7: Apply unresolved non-hierarchy dependencies from ancestors to descendant recommendations.

## Acceptance Criteria
- [ ] AC1: Function returns same order for identical input.
- [ ] AC2: Every ranked item includes rationale text or reason codes.
- [ ] AC3: Result items include priority path, spec type, ignored ancestor dependencies, and unfinished descendant context.
- [ ] AC4: Regression tests cover story-first ranking, container suppression, task suppression, and inherited blockers.

## Dependencies
- F-0012

## Open Questions
- Should unresolved dependency rule be strict or configurable?

## Notes
Align reason format with detail panel presentation needs. Dependency handling distinguishes hierarchy containment from true sequencing dependencies.
