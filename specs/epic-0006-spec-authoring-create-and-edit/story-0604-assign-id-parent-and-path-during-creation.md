# Assign ID, Parent, and Path During Creation

## ID
S-0604

## Type
Story

## Parent
F-0019

## Summary
As a product author, I can assign a valid parent and receive a valid ID and destination path so newly created specs land in the correct hierarchy position.

## Problem / Context
Canonical structure depends on valid hierarchy and deterministic file placement. Create flows need to handle these rules explicitly rather than relying on manual file naming.

## Goals
- Guide parent selection with hierarchy-safe options.
- Prevent duplicate or malformed IDs.
- Compute canonical destination path before write.

## Non-goals
- Allowing arbitrary file placement overrides in MVP.

## Requirements
- [ ] R1: Parent selection options are constrained to valid parent types for the chosen artifact type.
- [ ] R2: The system suggests or allocates a unique canonical ID and blocks collisions before save.
- [ ] R3: The UI shows the computed destination folder and filename before the write is confirmed.

## Acceptance Criteria
- [ ] AC1: Users cannot assign a Story directly under an Epic or a Task directly under a Feature.
- [ ] AC2: Duplicate IDs are rejected before file creation.
- [ ] AC3: The final saved path matches the previewed canonical placement.

## Dependencies
- F-0019
- S-0603

## Open Questions
- Should users be allowed to edit the suggested slug portion of the filename before save if the title changes?

## Notes
This story covers the placement and identity rules that make creation safe.
