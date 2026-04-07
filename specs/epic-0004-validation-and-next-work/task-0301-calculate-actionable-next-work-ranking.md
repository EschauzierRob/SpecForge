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
- Produce ranked list and reason codes.

## Non-goals
- Capacity-aware scheduling.

## Requirements
- [ ] R1: Filter out done and blocked items.
- [ ] R2: Exclude items with unresolved dependencies.
- [ ] R3: Rank remaining items by rank and status heuristics.

## Acceptance Criteria
- [ ] AC1: Function returns same order for identical input.
- [ ] AC2: Every ranked item includes rationale text or reason codes.

## Dependencies
- F-0012

## Open Questions
- Should unresolved dependency rule be strict or configurable?

## Notes
Align reason format with detail panel presentation needs.
