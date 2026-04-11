# Bootstrap AI Coder Instructions Into Repositories

## ID
S-0403

## Type
Story

## Parent
F-0014

## Summary
As a maintainer bootstrapping a repo, I want AI-facing SpecForge workflow instructions seeded alongside overlay essentials.

## Problem / Context
Bootstrap currently creates enough overlay structure for ingestion to run, but newly initialized repositories do not tell AI coding agents how to preserve the SpecForge specs-and-overlay workflow.

## Goals
- Seed clear AI-facing instructions in bootstrapped repositories.
- Point agents to the local overlay file and canonical spec boundaries.
- Avoid overwriting existing repository-specific agent instructions.

## Non-goals
- Enforcing workflow rules as hard runtime validation failures.
- Replacing project-specific contributor or agent instructions.

## Requirements
- [ ] R1: Bootstrap creates missing AI-facing SpecForge instruction files.
- [ ] R2: Bootstrapped instructions require reading `/specs` before implementation.
- [ ] R3: Bootstrapped instructions require keeping execution metadata in `specforge/overlay/local-dev.overlay.json`.
- [ ] R4: Bootstrap creates root `AGENTS.md` only when it is missing.

## Acceptance Criteria
- [ ] AC1: Loading a repo without SpecForge metadata creates AI instruction docs and reports them in bootstrap actions.
- [ ] AC2: Existing root `AGENTS.md` content is not overwritten or appended.
- [ ] AC3: Running bootstrap repeatedly does not change existing instruction files.

## Dependencies
- F-0014
- T-0401

## Open Questions
- Should future bootstrap support repository-specific instruction templates?

## Notes
This story extends bootstrap from operability-only setup to AI-agent workflow setup.
