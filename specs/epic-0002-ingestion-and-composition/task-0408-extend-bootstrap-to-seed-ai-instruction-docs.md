# Extend Bootstrap to Seed AI Instruction Docs

## ID
T-0408

## Type
Task

## Parent
S-0403

## Summary
Extend workspace bootstrap to create missing AI instruction docs without overwriting user-managed files.

## Problem / Context
Bootstrap creates overlay essentials but does not yet seed the AI workflow guidance needed to preserve SpecForge conventions.

## Goals
- Seed missing SpecForge README and AI instruction files.
- Preserve existing root `AGENTS.md` files.
- Keep bootstrap idempotent.

## Non-goals
- Mutating existing repository-specific agent instructions.

## Requirements
- [ ] R1: Bootstrap creates `specforge/README.md` when missing.
- [ ] R2: Bootstrap creates `specforge/overlay/README.md` when missing.
- [ ] R3: Bootstrap creates `specforge/ai-coder-instructions.md` when missing.
- [ ] R4: Bootstrap creates root `AGENTS.md` only when missing.

## Acceptance Criteria
- [ ] AC1: Missing instruction files are created during workspace load.
- [ ] AC2: Existing instruction files are not overwritten.
- [ ] AC3: A second bootstrap run creates no new artifacts.

## Dependencies
- S-0403
- T-0407

## Open Questions
- None

## Notes
The implementation should continue using the existing bootstrap action summary shape.
