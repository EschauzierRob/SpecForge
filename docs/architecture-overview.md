# Architecture Overview

## High-Level Flow

1. **Repository Loader** reads local repository paths.
2. **Parser Layer** ingests supported spec files.
3. **Canonical Mapper** normalizes parsed data into Epic→Feature→Story→Task nodes.
4. **Overlay Loader** reads planning metadata from `specforge/overlay`.
5. **Composer** merges canonical nodes with overlay projections at runtime.
6. **Validation Layer** evaluates structural and metadata integrity.
7. **Next-Work Engine** ranks actionable items.
8. **UI Layer (future implementation)** renders views and interactions.

## Major Components

### 1) Parser

Responsibilities:
- discover spec markdown files
- extract structured fields from standardized sections
- preserve source file references for traceability

Design notes:
- tolerant parsing (best-effort extraction)
- unknown fields retained as non-fatal parser notes
- explicit parser diagnostics for malformed sections

### 2) Canonical Model

Responsibilities:
- represent all spec artifacts as strongly typed entities
- enforce stable IDs and parent-child constraints
- provide in-memory graph traversal primitives

Primary hierarchy:
- Epic → Feature → Story → Task

### 3) Overlay Loader

Responsibilities:
- load one or more JSON overlay files
- validate schema shape and field types
- index overlay entries by `specId`

Design notes:
- overlay should be optional per item
- missing overlay is allowed and should not invalidate specs

### 4) Composer

Responsibilities:
- produce runtime nodes = canonical spec node + overlay projection
- resolve collisions using deterministic precedence rules
- annotate composed nodes with composition diagnostics

Composition principle:
- no mutation of source specs
- overlay projection is additive and external

### 5) Validation Layer

Responsibilities:
- run canonical hierarchy checks
- run ID and path convention checks
- run overlay-reference integrity checks
- emit warnings/errors with source pointers

Output model:
- machine-readable issue objects
- human-readable summaries for UI panels

### 6) Next-Work Engine

Responsibilities:
- filter to actionable story-sized work by default
- score by rank/status/blockers/dependencies plus inherited epic/feature priority path
- suppress parent containers when unfinished descendants are available
- output sorted recommendation list with rationale

Initial scoring inputs:
- planningStatus
- rank (ascending = higher priority)
- blocked flag
- unresolved dependencies

### 7) UI Layer (future)

Planned MVP views:
- hierarchical tree view
- board view by planning status
- detail panel
- validation warnings panel
- recommended next work panel

MVP UI scope excludes advanced workflow automation.

## Extensibility Considerations

- Adapter interface for additional spec ecosystems
- Pluggable normalization strategies
- Drift compensation layer for changed IDs/paths (post-v1.0)
- Read/write boundary abstraction for future write features
