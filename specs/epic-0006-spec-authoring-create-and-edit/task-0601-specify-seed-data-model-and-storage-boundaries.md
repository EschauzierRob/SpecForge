# Specify Seed Data Model and Storage Boundaries

## ID
T-0601

## Type
Task

## Parent
S-0601

## Summary
Define canonical documentation for Spec Seed fields, ID rules, storage location, and status lifecycle.

## Problem / Context
Without a precise contract for seed data and placement, implementation may drift and pollute canonical spec directories.

## Goals
- Document required and optional seed fields.
- Define unique seed ID strategy.
- Establish strict separation between `/specforge/seeds` and `/specs`.

## Non-goals
- Implementing seed persistence logic.

## Requirements
- [ ] R1: Documentation specifies seed schema (`id`, `title`, `description`, optional `context`, `status`, timestamps as needed).
- [ ] R2: Documentation defines allowed status values and transitions.
- [ ] R3: Documentation explicitly forbids seed file placement under `/specs`.

## Acceptance Criteria
- [ ] AC1: Seed storage contract is unambiguous enough to implement without directory interpretation gaps.
- [ ] AC2: Status lifecycle includes at minimum `not-started` and `expanded`.

## Dependencies
- S-0601

## Open Questions
- Should seed IDs be globally incrementing (`seed-####`) or UUID-based?

## Notes
Documentation-only task to de-risk storage and traceability design.
