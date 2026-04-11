# Define Bootstrapped AI Instruction File Content

## ID
T-0407

## Type
Task

## Parent
S-0403

## Summary
Define the AI-facing instruction content that bootstrap writes into newly initialized repositories.

## Problem / Context
Bootstrap needs deterministic instruction text so agents get consistent guidance across repositories.

## Goals
- Define concise SpecForge workspace instructions.
- Define detailed AI coder workflow instructions.
- Define a root agent entry point that points to the detailed workflow.

## Non-goals
- Creating repository-specific custom instructions.

## Requirements
- [ ] R1: Instruction content names `/specs` as the source of product intent.
- [ ] R2: Instruction content names `specforge/overlay/local-dev.overlay.json` as the execution metadata file.
- [ ] R3: Instruction content lists overlay fields AI agents must keep current.

## Acceptance Criteria
- [ ] AC1: Bootstrapped instruction text is deterministic and suitable for file snapshot assertions.
- [ ] AC2: The root AI instruction entry point points to `specforge/ai-coder-instructions.md`.

## Dependencies
- S-0403

## Open Questions
- None

## Notes
Keep the text short enough for agents to read before implementation work.
