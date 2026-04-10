# Roadmap

## v0.1 — Spec and Planning Scaffold (Current)

Deliverables:
- repository structure for specs and overlay
- architecture and model documentation
- spec templates and initial epic/feature/story/task decomposition
- example overlay schema and data

Outcome:
- implementation-ready planning baseline

## v0.2 — Local Ingestion Skeleton

Goals:
- implement local repository loader
- implement markdown spec discovery and baseline parser
- output canonical model JSON snapshot for debugging

## v0.3 — Overlay Composition Skeleton

Goals:
- load overlay JSON
- compose canonical + overlay runtime objects
- emit composition diagnostics

## v0.4 — Validation Engine MVP

Goals:
- implement core validation rules V-001..V-007 and V-101..V-104
- provide machine-readable findings output

## v0.5 — CLI + Developer Diagnostics

Goals:
- lightweight CLI commands for parse/compose/validate
- local developer workflow documentation

## v0.6 — MVP UI Foundation

Goals:
- shell UI with navigation and state management
- bind composed model into read-only screens

## v0.7 — MVP Views

Goals:
- hierarchy tree
- planning board grouped by status
- item detail panel

## v0.8 — Insight Panels

Goals:
- validation warnings panel
- recommended next work panel with rationale

## v0.9 — Hardening and Usability

Goals:
- improve error handling
- improve performance for medium repositories
- expand sample data and onboarding docs

## v1.0 — Local-First Read-Only MVP

Scope lock:
- local repository input
- canonical model + overlay composition
- validation and actionable recommendation list
- core UI views (tree, board, detail, warnings, next work)

## v1.1 — External Repository Support

- connect to remote repos (initial read-only connectors)
- local cache and refresh semantics

## v1.2 — Drift Compensation

- deliver epic E-0005: Spec Format Drift Compensation
- resilient matching when IDs/paths shift
- heuristics with explicit confidence and warnings
- canonical projection for non-standard repositories

## v1.3 — Controlled Write Capabilities

- safe overlay editing flows
- optional guided spec update proposals (not direct mutation by default)
