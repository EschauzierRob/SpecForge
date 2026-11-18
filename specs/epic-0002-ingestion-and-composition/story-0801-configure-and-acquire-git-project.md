# Configure and Acquire a Git-Backed Project

## ID
S-0801

## Type
Story

## Parent
F-0027

## Summary
As a SpecForge user, I can identify a remote Git repository and revision selection so the server can acquire it without access to my local filesystem.

## Problem / Context
A local absolute path is meaningful only to the machine that owns it and cannot identify a remotely hosted project for a SpecForge server.

## Goals
- Model project-source type and Git provenance explicitly.
- Acquire a complete server-side working copy atomically.
- Preserve existing local path loading.

## Non-goals
- Expose the working-copy location as project identity.
- Modify the remote or acquired repository.

## Requirements
- [ ] R1: Git project configuration includes a remote repository identifier, a branch/tag/commit selection, and an optional opaque credential reference.
- [ ] R2: Acquisition resolves the selection to a commit and makes only a complete working copy available to ingestion.
- [ ] R3: Local and Git source descriptors enter a shared ingestion boundary after acquisition and expose their read/write capability.

## Acceptance Criteria
- [ ] AC1: A valid public remote and selection load without a local developer path.
- [ ] AC2: An invalid remote or selection produces a categorized, sanitized error and no partially loaded project.
- [ ] AC3: Runtime project provenance reports the remote and resolved commit but not the internal checkout path as durable identity.

## Dependencies
- F-0004

## Open Questions
- Should duplicate project definitions for the same remote and selection share a working copy?

## Notes
Acquisition may use a checkout, clone, mirror, or equivalent mechanism; the observable atomicity and provenance requirements are normative, not the storage technique.
