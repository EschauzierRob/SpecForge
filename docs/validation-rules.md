# Validation Rules

## Objective

Detect structural, semantic, and convention issues across specs and overlay to prevent misleading planning outputs.

## Severity Levels

- **Error**: invalid structure that prevents reliable composition
- **Warning**: recoverable issue that may reduce planning quality
- **Info**: advisory issue with no immediate impact

## Core Canonical Rules

### V-001 Missing Parent

- Condition: non-epic item has empty or unresolved `parentId`
- Severity: Error
- Impact: hierarchy cannot be composed correctly

### V-002 Orphan Item

- Condition: item exists but is disconnected from any top-level epic lineage
- Severity: Warning
- Impact: may be invisible in tree/board context

### V-003 Duplicate ID

- Condition: two or more spec items share same `id`
- Severity: Error
- Impact: overlay linking and navigation become ambiguous

### V-004 Invalid Type

- Condition: `type` is not one of epic/feature/story/task
- Severity: Error
- Impact: canonical mapping unsupported

### V-005 Malformed Hierarchy

- Condition: parent-child type rules are violated (e.g., story under epic)
- Severity: Error
- Impact: canonical traversal and UI projections break

### V-006 Missing Required Fields

- Condition: required fields for entity type are absent
- Severity: Error
- Impact: item incompletely specified

### V-007 Path/Name Convention Violation

- Condition: file/folder naming deviates from repository conventions
- Severity: Warning
- Impact: discoverability and automation reliability reduced

## Overlay Integrity Rules

### V-101 Unknown specId in Overlay

- Condition: overlay entry references non-existent canonical ID
- Severity: Warning

### V-102 Invalid planningStatus Value

- Condition: status not in accepted enum
- Severity: Error

### V-103 Invalid Rank

- Condition: rank is non-integer or out-of-range (if configured)
- Severity: Warning

### V-104 Dependency Reference Missing

- Condition: overlay dependency references unknown ID
- Severity: Warning

## Execution Slice Rules

### V-200 Invalid Execution Slice Shape

- Condition: a slice or nested slice value violates the overlay `0.2` contract
- Severity: Error

### V-201 Invalid Slice Reference

- Condition: a slice references an unknown canonical spec, slice dependency, required evidence item, or observed evidence item
- Severity: Error

### V-202 Duplicate Slice ID

- Condition: multiple loaded overlays declare the same `sliceId`
- Severity: Error

### V-203 Thematic WIP Limit Exceeded

- Condition: more than one slice has status `in_progress` or `blocked`
- Severity: Error
- Note: ordinary overlay entries tagged `incidental` are outside thematic slice WIP

### V-204 Invalid Slice Lifecycle

- Condition: ready or active execution context is incomplete, or status and resolution are inconsistent
- Severity: Error

### V-205 Invalid Evidence Closure

- Condition: a done slice lacks the evidence or decision required by its resolution
- Severity: Error

### V-206 Inconsistent Blocker State

- Condition: a blocked slice has no open blocker, or an in-progress slice still has an open blocker
- Severity: Error

## Reporting Requirements

Each validation finding should include:

- rule ID (e.g., V-003)
- severity
- message
- affected `specId` if available
- source path(s)
- optional remediation hint

## Tolerant Parsing, Strict Validation

- parser should attempt to ingest imperfect files
- validation must make issues explicit
- system should avoid silent data loss
