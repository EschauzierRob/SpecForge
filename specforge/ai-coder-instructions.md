# AI Coder Instructions

Follow these rules for AI-assisted implementation in this repository.

## Required Workflow

1. Read `/specs` before implementing so product intent, hierarchy, and acceptance criteria are clear.
2. Keep product intent and requirements in `/specs`.
3. Keep planning and execution metadata in `specforge/overlay/local-dev.overlay.json`.
4. Before editing, identify every target spec ID that the change advances.
5. Ensure each changed target spec ID has an overlay entry.
6. After editing, update stale overlay fields for changed work:
   - `planningStatus`
   - `blocked`
   - `blockedReason`
   - `dependencies`
   - `notes`
   - `tags`
7. Run SpecForge parse, compose, and validate checks before finishing when the toolchain is available.

Thematic implementation should be represented by an execution slice when the overlay uses version `0.2`. Small unrelated defects may be fixed without blocking the active slice when their overlay entry is tagged `incidental`. Keep incidental work bounded; do not use it to hide a second active theme.

For an active slice:

- do not copy canonical acceptance criteria into the slice
- treat `requiredEvidence` as baselined once work starts
- add actual results to `observedEvidence` and link them through `satisfies`
- record a decision if the evidence threshold changes
- close with `resolution: validated`, `disproved`, or `killed`

Preferred local commands:

- `specforge/bin/specforge parse .`
- `specforge/bin/specforge compose .`
- `specforge/bin/specforge validate .`

When working inside the SpecForge source repository itself, this fallback is also valid:

- `node --experimental-strip-types ./src/cli.ts validate .`

## Canonical Spec Authoring

When creating or editing specs, use the SpecForge canonical markdown format. Do not use YAML frontmatter.

Valid canonical types are exactly:

- `Epic`
- `Feature`
- `Story`
- `Task`

Each canonical spec file must use these sections:

```markdown
# <Title>

## ID
<E-0000 | F-0000 | S-0000 | T-0000>

## Type
<Epic | Feature | Story | Task>

## Parent
<direct parent ID or None>

## Summary
<short summary>

## Problem / Context
<context>

## Goals
- <goal>

## Non-goals
- <non-goal>

## Requirements
- [ ] R1: <requirement>

## Acceptance Criteria
- [ ] AC1: <observable outcome>

## Dependencies
- <semantic/product spec ID dependency or None>

## Open Questions
- <question or None>

## Notes
<notes or None>
```

Hierarchy is `Epic -> Feature -> Story -> Task`. Every non-epic spec must set `## Parent` to its direct parent ID. Do not rely on markdown nesting to imply hierarchy.

Use one directory per epic:

```text
specs/
  epic-0001-short-name/
    epic.md
    feature-0001-short-name.md
    story-0001-short-name.md
    task-0001-short-name.md
```

Each feature, story, and task must be its own canonical file. Do not embed feature, story, or task specs as subsections inside an epic or parent spec. When generating implementation-ready work, use the full hierarchy where meaningful instead of collapsing stories and tasks into feature bullets.

## Overlay Entry Shape

Overlay entries link to canonical specs by the value in the spec's `## ID` section. A minimal local overlay entry is:

```json
{
  "specId": "T-0000",
  "planningStatus": "in_progress"
}
```

Allowed `planningStatus` values are `backlog`, `ready`, `in_progress`, `blocked`, and `done`.

## Boundary

Canonical `## Dependencies` sections contain semantic/product spec ID dependencies. Overlay `dependencies` contains planning or execution metadata.

Do not rewrite canonical specs just to record execution status. Use the overlay file for execution state.
