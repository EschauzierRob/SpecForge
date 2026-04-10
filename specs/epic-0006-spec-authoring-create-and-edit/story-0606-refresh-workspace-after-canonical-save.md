# Refresh Workspace After Canonical Save

## ID
S-0606

## Type
Story

## Parent
F-0020

## Summary
As a product author, I can see canonical changes reflected immediately after save so I can trust that the workspace matches disk state.

## Problem / Context
Even when save succeeds, stale UI state can make users doubt whether the repository changed or whether additional manual reload steps are required.

## Goals
- Keep the workspace synchronized with canonical file saves.
- Reflect created or edited artifacts immediately after save.
- Surface save errors clearly when refresh cannot complete.

## Non-goals
- Background live-sync for arbitrary external file changes.

## Requirements
- [ ] R1: Successful canonical saves trigger a workspace refresh or targeted reload that updates tree/detail surfaces.
- [ ] R2: Newly created artifacts become selectable in the UI immediately after save.
- [ ] R3: Save or refresh failures surface actionable messages and do not silently leave stale success state visible.

## Acceptance Criteria
- [ ] AC1: Saving a new or edited artifact updates visible workspace state without a manual restart.
- [ ] AC2: Newly created artifacts appear in the hierarchy after save.
- [ ] AC3: Failed refresh behavior is distinguishable from successful save behavior.

## Dependencies
- F-0020
- S-0605

## Open Questions
- Should refresh be a full workspace reload in MVP, or a smaller targeted update of the changed node and lineage?

## Notes
This story closes the loop between canonical persistence and read-model visibility.
