# Recommended Next Work Engine

## ID
F-0012

## Type
Feature

## Parent
E-0004

## Summary
Rank actionable work items using overlay and dependency signals and present a transparent recommendation list.

## Problem / Context
Teams with many defined tasks need clear prioritization guidance that is auditable and simple.

## Goals
- Filter out non-actionable items.
- Score remaining items by rank/status/blocked/dependencies.
- Return ordered list with rationale.

## Non-goals
- AI-based forecasting or effort estimation.

## Requirements
- [ ] R1: Exclude items in done status.
- [ ] R2: Exclude blocked items and items with unresolved dependencies from actionable list.
- [ ] R3: Prioritize lower rank values and ready status.
- [ ] R4: Emit rationale fields for each ranked item.

## Acceptance Criteria
- [ ] AC1: Engine returns deterministic ranked output for same input set.
- [ ] AC2: Each recommended item includes concise explanation of score factors.
- [ ] AC3: Items with missing optional overlay fields are handled predictably.

## Dependencies
- F-0006
- F-0010

## Open Questions
- Should recommendations default to story/task types only in MVP?

## Notes
Recommendation logic must be explainable and tunable in future releases.
