# AI Overlay Sync Workflow

## Purpose

Use this workflow whenever AI-assisted implementation changes code, docs, tests, or specs for one or more existing SpecForge work items.

The goal is to keep `specforge/overlay/local-dev.overlay.json` aligned with actual implementation progress without mutating canonical spec markdown.

When the overlay uses version `0.2`, thematic work also belongs to an execution slice. Keep the active slice's work, evidence, blockers, decisions, and single next action current. A small unrelated repair may stay outside the slice when its ordinary overlay entry is tagged `incidental`.

## Required Inputs

- the target spec IDs for the slice being implemented
- the current repository root
- the local overlay file at `specforge/overlay/local-dev.overlay.json`

## Mandatory Workflow

### 1. Identify the target spec IDs

List every spec ID that the implementation slice is advancing before editing files.

Include the feature plus any story or task IDs that move with the same change set.

### 2. Validate the local overlay file before implementation

Before making implementation edits, verify that `specforge/overlay/local-dev.overlay.json`:

- exists
- parses as JSON
- contains a top-level object with `version`, `repositoryId`, and `entries`
- uses an `entries` array whose items use supported fields only

If the file is missing, create it at the required path with the minimum valid shape:

```json
{
  "version": "0.2",
  "repositoryId": "specforge-local",
  "entries": [],
  "executionSlices": []
}
```

Workspace bootstrap upgrades a valid version `0.1` local overlay additively to `0.2`. If an existing file has an unsupported shape, bootstrap preserves it and reports a skipped migration; repair it deliberately before continuing. Do not move planning state into `/specs`.

### 3. Ensure every target spec ID has an overlay entry

Before implementation starts, confirm that each target spec ID already has an entry in `entries`.

If an entry is missing, add one in `specforge/overlay/local-dev.overlay.json`. A minimal entry is:

```json
{
  "specId": "F-0013",
  "planningStatus": "in_progress"
}
```

Allowed `planningStatus` values are:

- `backlog`
- `ready`
- `in_progress`
- `blocked`
- `done`

Other execution fields may be added when they help the current slice:

- `rank`
- `blocked`
- `blockedReason`
- `dependencies`
- `notes`
- `tags`

### 4. Implement the slice

Complete the requested implementation work across code, tests, and documentation.

Do not edit canonical spec markdown just to record execution state. Execution state belongs in the overlay file.

### 5. Sync execution-state fields after implementation

Before finishing the change set, revisit every target spec ID entry and correct stale execution metadata.

Update fields to match the real implementation state, including when:

- `planningStatus` changed from `ready` to `in_progress` or `done`
- `blocked` changed
- `blockedReason` is no longer accurate
- `dependencies` changed because prerequisite work was added or completed
- `notes` or `tags` no longer describe the current state

### 6. Validate the result

Run the local validation workflow after overlay edits so missing or invalid entries are caught in the same slice.

Recommended commands:

```powershell
npm run compose
npm run validate
```

If validation reports overlay problems, repair `specforge/overlay/local-dev.overlay.json` before considering the slice complete.

## Remediation Rules

When overlay state and implementation state disagree, update the overlay entry instead of changing canonical spec content.

Use these remediations:

- missing overlay file: create `specforge/overlay/local-dev.overlay.json` with the minimum valid structure
- missing target entry: add an entry for the spec ID in `entries`
- stale status: update `planningStatus` to the current execution state
- stale block metadata: update `blocked` and `blockedReason` together
- stale dependencies: remove completed prerequisites and add newly discovered ones
- invalid shape or unsupported keys: rewrite the entry so it only uses the documented overlay contract

## Completion Checklist

An AI-assisted slice is not complete until all of the following are true:

- `specforge/overlay/local-dev.overlay.json` exists and parses
- every target spec ID has an overlay entry
- execution-state fields reflect the latest implementation state
- validation passes without unresolved overlay-shape problems introduced by the slice

## Scope Boundary

This workflow changes overlay metadata only. Do not edit canonical spec markdown to record planning or execution state.
