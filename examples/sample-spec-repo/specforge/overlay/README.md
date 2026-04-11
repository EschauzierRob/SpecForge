# Overlay Metadata

Overlay files store planning and execution metadata independent of product specs.

## Local Overlay

Use `specforge/overlay/local-dev.overlay.json` for local planning state.

## Rules

- Entries link to specs by stable `specId`.
- Supported planning statuses are `backlog`, `ready`, `in_progress`, `blocked`, and `done`.
- Keep overlay metadata out of `/specs` markdown.
- AI-assisted implementation must update overlay entries for changed target spec IDs.
