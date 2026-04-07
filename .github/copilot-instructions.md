# Copilot Instructions for SpecForge

## Project Intent

SpecForge is a local-first, spec-driven planning and visualization tool.

## Non-Negotiable Boundary

- `/specs` contains source-of-truth product specs.
- `/specforge/overlay` contains planning metadata.
- Do not introduce planning fields directly into specs.

## Coding Priorities for Implementation Phases

1. Preserve deterministic parsing and composition behavior.
2. Prefer explicit, typed models over implicit shape assumptions.
3. Emit diagnostics rather than silently dropping malformed data.
4. Keep recommendation logic explainable.

## MVP Scope Guardrails

- Build read-only flows first.
- Do not implement full PM-suite behavior.
- Keep UI focused on: tree, board, detail, warnings, next work.

## Pull Request Expectations

- Include affected spec IDs in PR description when relevant.
- Update acceptance criteria status only when behavior is implemented and verified.
- If adding new fields, update model docs and schema examples in same PR.
