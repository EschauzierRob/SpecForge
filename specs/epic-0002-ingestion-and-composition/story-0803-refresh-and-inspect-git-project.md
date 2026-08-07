# Refresh and Inspect a Git-Backed Project

## ID
S-0803

## Type
Story

## Parent
F-0027

## Summary
As a SpecForge user, I can see which remote commit is displayed and explicitly refresh it while retaining a clearly stale last-known-good view if refresh fails.

## Problem / Context
Remote repository state changes independently of SpecForge. Without visible revision and synchronization state, users cannot tell whether planning views describe the current remote selection.

## Goals
- Make freshness and resolved revision visible.
- Refresh moving selections atomically on demand.
- Preserve an honest last-known-good experience when later synchronization fails.
- Keep parsing and presentation independent of source type.

## Non-goals
- Poll, schedule, or webhook-trigger refresh automatically.
- Merge remote changes with SpecForge-authored changes.

## Requirements
- [ ] R1: Git-backed project results expose requested selection, displayed commit, last successful synchronization time, latest attempt outcome, and current/stale status.
- [ ] R2: Refresh resolves a moving branch or tag again and atomically replaces the prior working copy only after acquisition succeeds; commit selections remain pinned.
- [ ] R3: Failed refresh retains only the prior complete revision, marks it stale, and provides a sanitized failure category and retry path.
- [ ] R4: The acquired tree is passed unchanged into existing spec discovery, parsing, overlay composition, validation, and presentation.

## Acceptance Criteria
- [ ] AC1: A successful refresh after a branch advances displays content from the newly resolved commit and marks it current.
- [ ] AC2: A failed refresh displays the previous commit with stale status and the last-success timestamp, without mixing files from revisions.
- [ ] AC3: Equivalent local and Git-backed repository trees yield equivalent parsed and composed project content apart from source provenance and sync state.

## Dependencies
- S-0801
- F-0005
- F-0006

## Open Questions
- How should “current” be worded when a remote may advance immediately after a successful resolution?

## Notes
“Current” means current as of the reported successful resolution, not a guarantee that the remote has not changed since. Automated refresh policy is intentionally deferred.
