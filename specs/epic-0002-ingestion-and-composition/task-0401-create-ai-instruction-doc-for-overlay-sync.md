# Create AI Instruction Doc for Overlay Sync

## ID
T-0401

## Type
Task

## Parent
S-0401

## Summary
Add a dedicated AI instruction doc defining required checks and corrections for `specforge/overlay/local-dev.overlay.json`.

## Problem / Context
There is no single source of truth for mandatory AI workflow behavior around overlay synchronization.

## Goals
- Publish explicit AI instructions for overlay validation and correction.

## Non-goals
- Implementing automated enforcement in code.

## Requirements
- [ ] R1: Document pre-change checks for overlay file existence and parse validity.
- [ ] R2: Document post-change corrections for missing spec entries and stale execution-state fields.

## Acceptance Criteria
- [ ] AC1: AI instruction document exists in repository docs and names the target overlay path.
- [ ] AC2: Document includes both validation and correction steps for overlay lifecycle handling.

## Dependencies
- S-0401

## Open Questions
- Should this instruction doc live with contributor docs or with runtime architecture docs?

## Notes
The doc should be optimized for AI-agent execution prompts and deterministic behavior.
