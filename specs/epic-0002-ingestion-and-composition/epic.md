# Ingestion and Composition Pipeline

## ID
E-0002

## Type
Epic

## Parent
None

## Summary
Implement the core data pipeline that loads repository specs from supported project sources, maps them into canonical hierarchy, loads overlay metadata, and composes runtime models.

## Problem / Context
Without an ingestion and composition backbone, SpecForge cannot provide validated planning views.

## Goals
- Ingest local-filesystem and Git-backed spec repositories.
- Parse supported markdown specs.
- Build canonical in-memory hierarchy.
- Load and attach overlay metadata by stable IDs.

## Non-goals
- Write changes back to Git-backed repositories.
- Automate branches, commits, pull requests, or external coding agents.

## Requirements
- [ ] R1: Local repository path input is supported.
- [ ] R2: Markdown files matching spec conventions are parsed.
- [ ] R3: Canonical hierarchy objects are built and linked.
- [ ] R4: Overlay metadata is loaded and composed.
- [ ] R5: Git-backed repository input is supported without requiring the SpecForge server to access a developer's local filesystem.

## Acceptance Criteria
- [ ] AC1: Pipeline can ingest this repository as a specimen.
- [ ] AC2: Composition output includes spec and overlay facets without source mutation.
- [ ] AC3: Diagnostics are emitted for malformed files without crashing whole ingest.
- [ ] AC4: The same canonical and overlay composition pipeline is used after either a local project or a Git-backed working copy is acquired.

## Dependencies
- E-0001

## Open Questions
- What parser strictness level should be default in v1.0?

## Notes
This epic establishes the operational core for all user-facing views. Project-source acquisition is separate from parsing and composition so additional source types and future Git write workflows do not require source-specific canonical models.
