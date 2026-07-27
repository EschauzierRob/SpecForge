# Restore a Bookmarkable Workspace URL

## ID
S-0202

## Type
Story

## Parent
F-0026

## Summary
As a SpecForge user, I can reopen a bookmarked workspace URL and continue at the same repository, tab, and selected item.

## Problem / Context
Users currently have to re-enter the local repository path after refresh and manually reconstruct their navigation context.

## Goals
- Remove repeated repository-path entry for bookmarked workspaces.
- Preserve useful inspection context across refresh and browser navigation.

## Non-goals
- Persist state outside the browser URL.

## Requirements
- [x] R1: Initial URL state is applied before the default repository context can overwrite it.
- [x] R2: A valid selected item remains selected after loading; an unavailable item falls back to the first composed node.
- [x] R3: History restoration does not create another history entry.

## Acceptance Criteria
- [x] AC1: Opening a bookmark with an encoded Windows repository path loads that repository automatically.
- [x] AC2: A bookmark with an unknown tab still opens the Overview tab safely.
- [x] AC3: A stale item ID does not prevent the repository from loading.

## Dependencies
- F-0026

## Open Questions
- None

## Notes
The existing POST API remains the repository-loading boundary; no new server endpoint is required.
