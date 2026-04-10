# Validation and Next Work Intelligence

## ID
E-0004

## Type
Epic

## Parent
None

## Summary
Implement validation and recommendation capabilities that make SpecForge actionable for daily planning.

## Problem / Context
Even with parsed and composed data, teams need confidence signals and prioritization guidance.

## Goals
- Detect structural and metadata integrity problems.
- Surface warnings clearly in user-facing panels.
- Recommend ranked actionable next work.

## Non-goals
- Predictive scheduling or team capacity optimization.

## Requirements
- [x] R1: Validation engine runs canonical and overlay rules.
- [x] R2: Warnings panel displays findings with source references.
- [x] R3: Next-work engine ranks actionable items by defined factors.

## Acceptance Criteria
- [x] AC1: Validation catches duplicate IDs, missing parents, and malformed hierarchy.
- [x] AC2: Warning panel supports filtering by severity.
- [x] AC3: Next-work panel explains why items are ranked as shown.

## Dependencies
- E-0002
- E-0003

## Open Questions
- Should next-work ranking weights be configurable in MVP or fixed?

## Notes
This epic turns data integrity and planning metadata into decision support.
