# AI Overlay Sync Guidance

## ID
F-0013

## Type
Feature

## Parent
E-0002

## Summary
Define AI-agent workflow requirements so feature implementation always validates and updates `local-dev.overlay.json`.

## Problem / Context
AI-generated changes can drift from overlay state, causing missing or stale execution metadata for spec IDs.

## Goals
- Ensure AI workflows always verify overlay entry existence for target spec IDs.
- Ensure AI workflows keep overlay execution state aligned with implementation progress.
- Standardize remediation steps when overlay content is missing or invalid.

## Non-goals
- Implementing runtime overlay composition logic.
- Defining a new overlay schema beyond the existing contract.

## Requirements
- [ ] R1: Workflow guidance defines mandatory checks for `specforge/overlay/local-dev.overlay.json` before and after implementation updates.
- [ ] R2: Guidance requires creation of missing entries for target spec IDs when absent.
- [ ] R3: Guidance requires correction of stale execution-state fields when implementation state changes.

## Acceptance Criteria
- [ ] AC1: Maintainers can follow one documented workflow that always validates overlay coverage for changed spec IDs.
- [ ] AC2: The workflow explicitly describes how to add or repair overlay entries without changing canonical spec markdown.
- [ ] AC3: Primary contributor docs point to the guidance so it is discoverable during normal development.

## Dependencies
- F-0002
- F-0006

## Open Questions
- Should overlay sync be enforced as a hard failure in automation or start as warning-only?

## Notes
Scope includes AI-agent instructions, contributor workflow, and documentation linkage only.
