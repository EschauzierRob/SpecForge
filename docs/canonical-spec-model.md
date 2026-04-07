# Canonical Spec Model

## Purpose

Define a consistent internal hierarchy for all ingested specs, regardless of source repository conventions.

## ID Convention (v0.1)

- Epic: `E-####`
- Feature: `F-####`
- Story: `S-####`
- Task: `T-####`

IDs must be globally unique within a repository scope.

## Common Fields (all types)

### Required

- `id` — stable unique identifier
- `type` — one of `epic | feature | story | task`
- `title` — concise descriptive title
- `summary` — short purpose statement
- `sourcePath` — relative file path in repository

### Optional

- `description` — extended context
- `dependencies` — semantic/product dependencies (not planning rank)
- `acceptanceCriteria` — list of verifiable outcomes
- `notes` — supplementary information

## Entity Definitions

### Epic

**Purpose:** Largest product-aligned delivery area.

**Required fields:**
- common required fields
- `goals`
- `nonGoals`

**Optional fields:**
- `assumptions`
- `risks`

**Parent/child rules:**
- parent: none
- children: feature only

### Feature

**Purpose:** Concrete capability within an epic.

**Required fields:**
- common required fields
- `parentId` (must reference epic)
- `requirements`

**Optional fields:**
- `constraints`

**Parent/child rules:**
- parent: epic only
- children: story only

### Story

**Purpose:** User or system behavior slice delivering incremental value.

**Required fields:**
- common required fields
- `parentId` (must reference feature)
- `acceptanceCriteria`

**Optional fields:**
- `scenarios`

**Parent/child rules:**
- parent: feature only
- children: task only

### Task

**Purpose:** Smallest implementation unit with clear done conditions.

**Required fields:**
- common required fields
- `parentId` (must reference story)

**Optional fields:**
- `technicalNotes`
- `definitionOfDone`

**Parent/child rules:**
- parent: story only
- children: none

## Hierarchy Rules

1. No skipped levels in canonical parent-child links.
2. No cycles.
3. Every non-epic item must have a resolvable parent.
4. Items may reference additional semantic dependencies via IDs, but those do not replace parent links.

## Parsing Guidance

- parser should tolerate section ordering differences
- missing required fields become validation findings
- unknown sections should be preserved as parser metadata when feasible
