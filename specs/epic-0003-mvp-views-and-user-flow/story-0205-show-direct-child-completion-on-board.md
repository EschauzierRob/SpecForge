# Show Direct Child Completion on Board

## ID
S-0205

## Type
Story

## Parent
F-0028

## Summary
As a planner, I can see how many Tasks a Story contains and how many Stories a Feature has completed without opening details.

## Problem / Context
Hidden Task cards must not hide execution progress. Feature rows also need a concise summary of their Stories across status columns.

## Goals
- Show explicit completed and total child counts.
- Keep progress stable when display filters change.

## Non-goals
- Weighted percentages, recursive descendant counts, or automatic parent-status changes.

## Requirements
- [ ] R1: Each Story card displays Tasks: completed/total complete, counting only Task nodes whose direct parent ID is that Story.
- [ ] R2: Each Feature row label displays Stories: completed/total complete, counting only Story nodes whose direct parent ID is that Feature.
- [ ] R3: A child counts as complete only when its overlay planningStatus is done. Missing overlay, missing status, and all other statuses count toward total but not complete; blocked metadata does not override done for this calculation.
- [ ] R4: Calculate counts over the full composed model before any Board filters. Recompute after composed data changes without deriving parent status from progress.
- [ ] R5: Show explicit 0/0 counts for items without children. Do not count grandchildren, dependencies, or references to unavailable nodes.

## Acceptance Criteria
- [ ] AC1: A Story with five Tasks of which three are done shows Tasks: 3/5 complete with Task cards hidden and with either quick filter active.
- [ ] AC2: A Feature with three Stories of which one is done shows Stories: 1/3 complete, regardless of Task completion or which Story cards are visible.
- [ ] AC3: Zero-child Stories and Features show 0/0; mixed missing-overlay and blocked statuses produce the specified totals without errors.
- [ ] AC4: Refreshing composed data updates counts while preserving explicit parent statuses and the active Board filters.

## Dependencies
- S-0204

## Open Questions
- None

## Notes
Completion is an overlay-status summary rather than a count of checked canonical acceptance criteria. Use visible text accessible to assistive technology; no progress bar is required.
