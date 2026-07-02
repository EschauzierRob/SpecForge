# Add Safe NPM Script Aliases

## ID
T-0413

## Type
Task

## Parent
S-0411

## Summary
Add optional SpecForge npm script aliases for repositories that already use `package.json`.

## Problem / Context
Node repositories benefit from familiar npm commands, but bootstrap must not impose npm on non-Node repositories or overwrite existing scripts.

## Goals
- Add `specforge:parse`, `specforge:compose`, and `specforge:validate` when safe.
- Preserve existing script names and commands.
- Avoid creating `package.json` in repositories that do not already have one.

## Non-goals
- Adding npm dependencies.
- Running package managers during bootstrap.

## Requirements
- [ ] R1: Existing `package.json` files receive missing SpecForge script aliases.
- [ ] R2: Existing conflicting aliases are preserved.
- [ ] R3: Repositories without `package.json` are unchanged.

## Acceptance Criteria
- [ ] AC1: Tests verify additive script creation.
- [ ] AC2: Tests verify conflicting script preservation.

## Dependencies
- T-0411

## Open Questions
- None

## Notes
The scripts call the vendored runtime directly with Node.
