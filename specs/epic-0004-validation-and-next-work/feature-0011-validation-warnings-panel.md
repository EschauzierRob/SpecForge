# Validation Warnings Panel

## ID
F-0011

## Type
Feature

## Parent
E-0004

## Summary
Display validation findings in an inspectable, filterable warnings panel within the MVP UI.

## Problem / Context
Raw findings are difficult to act on without clear UI organization.

## Goals
- Present findings by severity and rule.
- Link findings to affected items.

## Non-goals
- Automated fix suggestions in MVP.

## Requirements
- [x] R1: Render list of findings with severity indicator and message.
- [x] R2: Provide filters for severity and rule ID.
- [x] R3: Selecting a finding navigates to impacted item when available.

## Acceptance Criteria
- [x] AC1: Users can isolate Errors vs Warnings quickly.
- [x] AC2: Empty state is clear when no findings exist.
- [x] AC3: Navigation from finding to detail view succeeds for linked spec IDs.

## Dependencies
- F-0009
- F-0010

## Open Questions
- Should warnings panel default to showing only Errors and Warnings?

## Notes
Findings need to be understandable by both engineers and product stakeholders.
