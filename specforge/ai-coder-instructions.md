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

## Overlay Entry Shape

A minimal local overlay entry is:

```json
{
  "specId": "T-0000",
  "planningStatus": "in_progress"
}
```

Allowed `planningStatus` values are `backlog`, `ready`, `in_progress`, `blocked`, and `done`.

## Boundary

Do not rewrite canonical specs just to record execution status. Use the overlay file for execution state.
