# Bootstrap Required SpecForge Files on Load

## ID
S-0402

## Type
Story

## Parent
F-0014

## Summary
As a user, I can load partially-initialized repositories and have missing SpecForge directories/files created automatically.

## Problem / Context
New or migrated repositories may omit required SpecForge files, blocking ingestion and downstream workflow steps.

## Goals
- Make repository load resilient to missing SpecForge essentials.
- Preserve clear visibility into what bootstrap created.

## Non-goals
- Backfilling non-essential project-specific content.

## Requirements
- [ ] R1: Loader performs bootstrap checks before discovery/parse/compose.
- [ ] R2: Loader creates missing required folders/files and then proceeds with ingestion.
- [ ] R3: Loader reports bootstrap actions through CLI/API summaries.

## Acceptance Criteria
- [ ] AC1: Loading a partially initialized repo no longer fails due only to missing SpecForge essentials.
- [ ] AC2: Output clearly identifies which artifacts were created during bootstrap.

## Dependencies
- F-0014

## Open Questions
- Should bootstrap summary include file content hashes or path names only?

## Notes
This story emphasizes user-facing operability and observability.
