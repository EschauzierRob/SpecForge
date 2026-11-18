# Validate Board Hierarchy and Progress

## ID
T-0207

## Type
Task

## Parent
S-0204

## Summary
Validate the combined Board hierarchy behavior through meaningful selector regressions, browser review, and repository checks.

## Problem / Context
Filters, row context, progress, and detail selection interact; isolated checks cannot establish that the combined Board remains understandable and accurate.

## Goals
- Verify observable outcomes across the complete Feature.
- Record actual implementation evidence without duplicating canonical acceptance criteria in execution metadata.

## Non-goals
- Snapshot tests of CSS values or a new general-purpose UI testing platform.

## Requirements
- [ ] R1: Extend the existing UI-state tests with a multi-Epic fixture containing Features, cross-status Stories, mixed-status Tasks, missing overlays, and unresolved parent references; assert filtering, grouping, counts, and progress together.
- [ ] R2: Cover all type combinations and existing quick-filter combinations, including no matches, hidden parents, unresolved items, and unchanged shared Overview counts.
- [ ] R3: Review the rendered Board at desktop and 375 CSS-pixel widths using mouse and keyboard, checking visible hierarchy, non-color type cues, focus, overflow, detail navigation, and filter reset/preservation behavior.
- [ ] R4: Run the full existing test suite, UI production build, and SpecForge parse, compose, and validate checks; record actual results and any pre-existing unrelated failures in implementation overlay evidence.

## Acceptance Criteria
- [ ] AC1: Automated regressions establish S-0203 through S-0206 behavior, including one-card-per-item counting and progress independent of visible cards.
- [ ] AC2: Browser evidence identifies reviewed viewport sizes and navigation scenarios and confirms no nested controls, overlapping content, or inaccessible status columns.
- [ ] AC3: Repository checks and build pass, or any demonstrably pre-existing unrelated failure is explicitly recorded without declaring that check passed; introduced failures are resolved before closing implementation work.

## Dependencies
- S-0203
- S-0204
- S-0205
- S-0206

## Open Questions
- None

## Notes
This Task describes future UI implementation validation. Merely parsing these specs does not satisfy its acceptance criteria. Establish the implementation execution slice and required evidence before starting UI work.
