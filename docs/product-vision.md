# Product Vision

## Vision Statement

SpecForge helps teams execute spec-driven development with confidence by separating product definition from planning execution and making next steps obvious.

## Target Users

- Product engineers working from markdown specs
- Tech leads coordinating feature delivery
- Product managers tracking structured requirements
- Small teams that need lightweight planning without heavyweight ALM tools

## Primary Pain Point

Teams know what they want to build, but cannot reliably determine what should happen next across a large, evolving spec hierarchy.

## Desired Workflow

1. Point SpecForge to a local repository containing specs.
2. Parse and normalize specs into a canonical hierarchy.
3. Load a planning overlay from separate metadata files.
4. Compose a runtime model for views and analysis.
5. Review hierarchy, board status, warnings, and recommendations.
6. Decide and execute next work outside the tool (MVP is read-only).

## Core Use Case: “What should I do next?”

SpecForge should produce practical recommendations using:

- planning status
- ranking
- blocked state
- dependencies

The recommendation does not replace judgment; it provides a transparent starting point for action.

## Product Principles

1. **Spec integrity first** — specs remain authoritative and minimally volatile.
2. **Planning decoupled** — execution metadata belongs in overlay.
3. **Explainability** — warnings and recommendations must show why.
4. **MVP discipline** — solve core planning clarity before automation.
5. **Extensibility by design** — adapters, drift handling, and write paths are future-ready.

## Non-Goals for v1.0

- Full project management suite replacement
- Multi-user workflow orchestration
- Real-time collaboration features
- Automatic spec rewriting
- Deep metrics/analytics platform
