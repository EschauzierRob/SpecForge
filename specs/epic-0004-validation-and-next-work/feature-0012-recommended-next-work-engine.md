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
- Score remaining work units by rank/status/blocked/dependencies and inherited hierarchy priority.
- Recommend story-sized implementation slices first while using epics and features as priority context.
- Return ordered list with rationale.

## Non-goals
- AI-based forecasting or effort estimation.

## Requirements
- [ ] R1: Exclude items in done status.
- [ ] R2: Exclude blocked items and items with unresolved dependencies from actionable list.
- [ ] R3: Prioritize lower rank values and ready status.
- [ ] R4: Emit rationale fields for each ranked item.
- [ ] R5: Treat epics/features with unfinished descendants as planning containers, not direct next-work recommendations.
- [ ] R6: Treat ancestor references in dependency lists as hierarchy context, not unresolved blockers.
- [ ] R7: Inherit non-hierarchy dependency blockers from ancestor containers to their child work units.

## Acceptance Criteria
- [ ] AC1: Engine returns deterministic ranked output for same input set.
- [ ] AC2: Each recommended item includes concise explanation of score factors.
- [ ] AC3: Items with missing optional overlay fields are handled predictably.
- [ ] AC4: The first unfinished story under the highest-priority epic/feature path appears before its parent containers.
- [ ] AC5: Recommendation rationale exposes the priority path that boosted the work unit.

## Dependencies
- F-0006
- F-0010

## Open Questions
- Should the UI add an optional task checklist under the selected story recommendation?

## Notes
Recommendation logic must be explainable and tunable in future releases. The MVP default recommendation unit is a story; tasks remain implementation detail unless no unfinished story ancestor exists.
