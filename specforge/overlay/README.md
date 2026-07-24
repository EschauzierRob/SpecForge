# Overlay Metadata

Overlay files store planning and execution metadata independent of product specs.

## Minimum Contract

- entries link to specs by `specId`
- overlay fields are optional unless noted by schema
- unknown spec IDs should generate warnings during validation
- version `0.2` overlays may contain `executionSlices`
- version `0.1` overlays remain readable and compose with an empty slice collection

## Execution Slices

Execution slices are bounded thematic work packages. They link to canonical specs without becoming part of the `Epic -> Feature -> Story -> Task` hierarchy. A slice owns its planned execution work, scope, entry and exit criteria, required and observed evidence, decisions, blockers, and one concrete next action.

- statuses reuse `backlog`, `ready`, `in_progress`, `blocked`, and `done`
- at most one thematic slice may be `in_progress` or `blocked`
- `done` means closed; `resolution` records `validated`, `disproved`, or `killed`
- required evidence is agreed before execution; observed evidence explicitly states what it satisfies
- external provenance identifies repository, immutable commit, artifact path, observation time, and consumer verification
- required evidence is baselined when work begins; later changes require a recorded decision

Small unrelated fixes do not have to block the active slice. Keep them as normal overlay work tagged `incidental`. The tag is for bounded maintenance, not a second thematic workstream.

## Recommended File Strategy

- keep one base overlay for local development (`local-dev.overlay.json`), which is the current execution authority
- optionally support layered overlays in future versions (team/sprint/personal)

## Important

Do not copy overlay fields into `/specs` markdown files.

For AI-assisted implementation, follow `docs/ai-overlay-sync-workflow.md` to validate, add, or repair entries in `specforge/overlay/local-dev.overlay.json` before and after changes.

Bootstrapped repositories also include `specforge/ai-coder-instructions.md` so AI coding agents can find the same workflow guidance locally.
