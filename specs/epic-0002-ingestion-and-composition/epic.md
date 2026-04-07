# Ingestion and Composition Pipeline

## ID
E-0002

## Type
Epic

## Parent
None

## Summary
Implement the core data pipeline that loads local repository specs, maps them into canonical hierarchy, loads overlay metadata, and composes runtime models.

## Problem / Context
Without an ingestion and composition backbone, SpecForge cannot provide validated planning views.

## Goals
- Ingest local spec repositories.
- Parse supported markdown specs.
- Build canonical in-memory hierarchy.
- Load and attach overlay metadata by stable IDs.

## Non-goals
- Implement remote repository connectors (v1.1+).

## Requirements
- [ ] R1: Local repository path input is supported.
- [ ] R2: Markdown files matching spec conventions are parsed.
- [ ] R3: Canonical hierarchy objects are built and linked.
- [ ] R4: Overlay metadata is loaded and composed.

## Acceptance Criteria
- [ ] AC1: Pipeline can ingest this repository as a specimen.
- [ ] AC2: Composition output includes spec and overlay facets without source mutation.
- [ ] AC3: Diagnostics are emitted for malformed files without crashing whole ingest.

## Dependencies
- E-0001

## Open Questions
- What parser strictness level should be default in v1.0?

## Notes
This epic establishes the operational core for all user-facing views.
