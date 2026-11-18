# Implement Board Child Progress

## ID
T-0205

## Type
Task

## Parent
S-0205

## Summary
Compute direct-child completion from unfiltered composed nodes and display it on Stories and Feature row labels.

## Problem / Context
Display filters and hidden Task cards must not affect child totals or completion counts.

## Goals
- Provide stable, explicit progress summaries from existing data.

## Non-goals
- Persisted progress fields, weighted completion, or parent-status updates.

## Requirements
- [ ] R1: Index direct children by parent ID and canonical type from the complete composed-node collection; expose completed and total counts for Story Tasks and Feature Stories.
- [ ] R2: Count only overlay planningStatus done as completed, independently of blocked metadata; count missing-status children only in the total.
- [ ] R3: Render readable Tasks: completed/total complete on Story cards and Stories: completed/total complete in Feature row labels, including 0/0.
- [ ] R4: Recompute on composed-data changes and keep calculations independent of selected types, quick filters, and parent status.

## Acceptance Criteria
- [ ] AC1: Regressions cover zero children, mixed statuses, missing overlays, done with blocked metadata, unrelated nodes, grandchildren, and filter-invariant results.
- [ ] AC2: Browser review confirms visible progress updates on data refresh without altering filters or explicit statuses.

## Dependencies
- S-0205

## Open Questions
- None

## Notes
Use derived UI data only. Completion does not inspect checked requirements or acceptance criteria in Markdown.
