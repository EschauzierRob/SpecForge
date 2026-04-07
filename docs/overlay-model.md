# Overlay Model

## Purpose

The overlay model captures planning and execution metadata **outside** source specs.

Specs define product intent; overlay defines operational planning state.

## Why these fields do not belong in specs

Planning metadata (rank, board status, blocked state) changes frequently and is workflow-specific. Embedding it in spec files causes:

- noisy diffs
- accidental source-of-truth drift
- unclear ownership between product intent and execution tactics

Keeping overlay separate preserves spec integrity and enables multiple planning projections over the same spec set.

## Overlay Entry Structure (Conceptual)

```json
{
  "specId": "S-0101",
  "planningStatus": "ready",
  "rank": 12,
  "blocked": false,
  "dependencies": ["T-0910"],
  "notes": "Waiting for parser diagnostics baseline",
  "tags": ["mvp", "ingestion"]
}
```

## Field Definitions

### Required

- `specId` (string)
  - stable link to canonical spec item ID

### Optional (v1.0)

- `planningStatus` (enum)
  - proposed values: `backlog | ready | in_progress | blocked | done`
- `rank` (integer)
  - lower numbers indicate higher priority
- `blocked` (boolean)
  - quick explicit block marker
- `dependencies` (string[])
  - execution dependencies by spec ID
- `notes` (string)
  - short human planning notes
- `tags` (string[])
  - planning/filter labels

## Overlay File Model

Suggested top-level structure:

```json
{
  "version": "0.1",
  "repositoryId": "specforge-local",
  "entries": []
}
```

## Composition Rules

1. Overlay never mutates canonical spec fields.
2. Missing overlay entries are allowed.
3. Overlay entries with unknown `specId` create warnings.
4. Multiple overlay files may be merged with deterministic precedence (future extension).

## Future Extensions

- multi-overlay layering (team, sprint, personal)
- audit history of overlay changes
- conflict-resolution strategy for write-capable mode
