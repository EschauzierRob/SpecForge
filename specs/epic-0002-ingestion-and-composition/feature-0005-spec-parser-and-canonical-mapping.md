# Spec Parser and Canonical Mapping

## ID
F-0005

## Type
Feature

## Parent
E-0002

## Summary
Parse structured markdown specs and map them into canonical entities with stable parent-child relationships.

## Problem / Context
Raw markdown cannot be consumed directly by views and planning logic.

## Goals
- Extract fields from standard spec sections.
- Normalize to canonical model.
- Preserve source references for diagnostics.

## Non-goals
- NLP parsing of free-form documents.

## Requirements
- [ ] R1: Parse ID, type, parent, summary, requirements, acceptance criteria.
- [ ] R2: Support tolerant parsing with diagnostics for missing sections.
- [ ] R3: Build canonical graph links.

## Acceptance Criteria
- [ ] AC1: Parser successfully ingests all specs under this scaffold.
- [ ] AC2: Missing required fields are reported for validation layer.
- [ ] AC3: Canonical output contains sourcePath for every node.

## Dependencies
- F-0001
- F-0004

## Open Questions
- Should parser support front-matter fallback in v1.0 or post-MVP?

## Notes
Prefer explicit section extraction over heuristic inference.
