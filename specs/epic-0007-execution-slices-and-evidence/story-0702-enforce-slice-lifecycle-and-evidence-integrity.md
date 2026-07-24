# Enforce Slice Lifecycle and Evidence Integrity

## ID
S-0702

## Type
Story

## Parent
F-0023

## Summary
As a SpecForge user, I want lifecycle and evidence inconsistencies reported so that a slice cannot appear complete without an honest recorded outcome.

## Problem / Context
Structural JSON validity alone cannot enforce reference integrity, low WIP, blocker consistency, or evidence-backed closure.

## Goals
- Validate canonical, slice, and evidence references.
- Enforce one active thematic slice across in-progress and blocked states.
- Support successful and negative closure resolutions.

## Non-goals
- Decide automatically whether an incidental fix is too large.
- Inspect Git history to prove required-evidence immutability.

## Requirements
- [ ] R1: Ready and active slices have satisfied entry criteria and executable context.
- [ ] R2: A validated resolution requires passing observations for all required evidence.
- [ ] R3: A disproved resolution requires complete evidence coverage including a failed observation.
- [ ] R4: A killed resolution requires an explicit decision.
- [ ] R5: Active blocker state and blocked status remain consistent.

## Acceptance Criteria
- [ ] AC1: Every lifecycle violation maps to a documented validation finding.
- [ ] AC2: A valid negative result can be done without being represented as success.
- [ ] AC3: A blocked slice prevents another thematic slice from becoming active.

## Dependencies
- S-0701

## Open Questions
- None

## Notes
Required evidence is considered baselined when a slice first becomes in_progress; changing it afterwards requires a recorded decision and remains reviewable in version control.
