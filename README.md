# SpecForge

SpecForge is a **local-first planning and visualization tool for spec-driven development**.

It is designed for teams that already keep requirements in a repository and want a reliable way to answer:

- What is defined?
- What is missing?
- What is risky?
- **What should we do next?**

## Why SpecForge exists

Many teams mix product specification and execution planning in the same files. That causes churn, noisy diffs, and unclear ownership. SpecForge separates these concerns:

1. **`/specs` = source-of-truth product definition**
2. **`/specforge/overlay` = planning and execution projection**

This separation keeps specs stable and meaningful while allowing planning to evolve rapidly.

## Core model: specs + overlay

### Specs (`/specs`)
Specs describe product intent and structure:
- Epic
- Feature
- Story
- Task

Specs answer: what the product should do, why it matters, and how success is measured.

### Overlay (`/specforge/overlay`)
Overlay files add planning metadata without editing specs:
- planning status
- rank
- blocked state
- dependencies for execution
- board grouping inputs
- bounded execution slices with required and observed evidence

Overlay entries refer to spec items by stable IDs.

Version `0.2` overlays can also define execution slices as a separate operational layer above the canonical hierarchy. See `docs/execution-slices.md` for lifecycle, evidence, low-WIP, and incidental-work rules.

## What this repository includes now (v0.1 scaffold)

This repository contains a complete planning and specification scaffold for v1.0 implementation work:

- Product and architecture documents in `docs/`
- A full spec tree in `specs/` with epics/features/stories/tasks
- Reusable markdown templates for future specs
- Overlay model docs and example JSON data
- Example repository layout under `examples/` for dogfooding
- Contributor guidance for AI-assisted implementation

This scaffold is intentionally **implementation-light**. It defines the work clearly enough that future development can begin immediately.

## v1.0 target outcomes

v1.0 focuses on an MVP that can:

1. Read a local repository of specs
2. Parse and normalize specs into a canonical model
3. Load overlay metadata separately
4. Compose specs + overlay at runtime
5. Validate structure and surface warnings
6. Show MVP views:
   - hierarchy tree
   - planning board
   - item detail panel
   - validation warnings panel
   - recommended next work panel
   - execution slice inspection

## How to contribute

1. Start with `docs/architecture-overview.md` and `docs/roadmap.md`.
2. Use `specs/README.md` and templates in `specs/templates/` when adding or modifying specs.
3. Keep planning metadata out of spec files; use overlay JSON in `specforge/overlay/`.
4. Preserve stable IDs. IDs are the integration contract between specs and overlay.
5. Follow `docs/ai-overlay-sync-workflow.md` for any AI-assisted implementation so `specforge/overlay/local-dev.overlay.json` stays aligned with changed spec IDs.
6. Add acceptance criteria for any new behavior before implementation.

## Developer Workflow

Use the CLI to inspect each pipeline stage locally:

- `parse` for canonical spec output and parser diagnostics
- `compose` for canonical plus overlay composition
- `validate` for rule-based findings
- `ingest` remains available as a compatibility alias for `compose`

See `docs/local-developer-workflow.md` for command examples, JSON output options, artifact writing, and exit-code behavior.

When an implementation slice is AI-assisted, also follow `docs/ai-overlay-sync-workflow.md` before and after code changes so overlay entries stay in sync with progress.

## UI Foundation

Slice 5 adds a local UI shell under `ui/` plus a small Node API bridge.

- `npm run ui:server` starts the local bridge used by the browser app
- `npm run ui:client` starts the Vite development server
- `npm run ui:build` builds the UI bundle

See `docs/local-developer-workflow.md` for the full two-terminal startup flow and the UI endpoint details.

## Repository map

- `docs/` — business, product, architecture, model, and roadmap docs
- `specs/` — source-of-truth domain artifacts and development decomposition
- `specforge/overlay/` — planning metadata schema and examples
- `specforge/indexes/` — placeholder for generated read models/indexes
- `specforge/adapters/` — placeholder for parser adapters and ecosystem integration
- `examples/` — sample repo structures for testing and onboarding

- `ui/` - React + Vite workspace for the local read-only UI shell

---

SpecForge v0.1 is the contract and runway for implementation, not the implementation itself.
