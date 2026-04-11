# Overlay Metadata

Overlay files store planning and execution metadata independent of product specs.

## Minimum Contract

- entries link to specs by `specId`
- overlay fields are optional unless noted by schema
- unknown spec IDs should generate warnings during validation

## Recommended File Strategy

- keep one base overlay for local development (`local-dev.overlay.json`)
- optionally support layered overlays in future versions (team/sprint/personal)

## Important

Do not copy overlay fields into `/specs` markdown files.

For AI-assisted implementation, follow `docs/ai-overlay-sync-workflow.md` to validate, add, or repair entries in `specforge/overlay/local-dev.overlay.json` before and after changes.

Bootstrapped repositories also include `specforge/ai-coder-instructions.md` so AI coding agents can find the same workflow guidance locally.
