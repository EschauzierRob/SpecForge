# Specify ID Allocation and Collision Prevention Rules

## ID
T-0604

## Type
Task

## Parent
S-0604

## Summary
Define how authoring flows generate or suggest canonical IDs, detect collisions, and derive canonical file placement from type and parent context.

## Problem / Context
Direct authoring needs deterministic rules for IDs and paths, or users will create duplicates and malformed hierarchy placements.

## Goals
- Define ID allocation or suggestion rules.
- Prevent duplicate IDs before write.
- Define deterministic path derivation for each artifact type.

## Non-goals
- Reserving IDs across distributed multi-user sessions in real time.

## Requirements
- [ ] R1: The rules define how each type receives an ID in the `E/F/S/T-####` format.
- [ ] R2: The create flow checks for existing collisions before write confirmation.
- [ ] R3: Path derivation rules define folder and filename placement for every artifact type from the chosen parent context.

## Acceptance Criteria
- [ ] AC1: An implementer can derive the final path for a new artifact from the documented rules.
- [ ] AC2: Collision handling is explicit enough to prevent ambiguous save behavior.

## Dependencies
- S-0604
- T-0603

## Open Questions
- Should the first available numeric gap be reused, or should the generator always pick the next highest observed ID?

## Notes
This task defines the identity and placement contract for direct canonical creation.
