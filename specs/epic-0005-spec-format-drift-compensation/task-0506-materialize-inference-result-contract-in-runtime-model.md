# Materialize Inference Result Contract in Runtime Model

## ID
T-0506

## Type
Task

## Parent
S-0504

## Summary
Add the shared inference result contract to runtime types and compose output so validation and UI layers can consume inferred structure.

## Problem / Context
Documentation alone is not enough; inferred-edge metadata must be carried through the actual runtime model.

## Goals
- Add typed runtime fields for inferred-edge metadata.
- Thread inference results through parse, compose, validation, and UI contracts.
- Preserve backward compatibility for canonical repositories without inferred structure.

## Non-goals
- Implementing all inference strategies in this task.

## Requirements
- [ ] R1: Runtime model includes inferred relationship state, candidate parents, evidence, strategy IDs, and stable target keys.
- [ ] R2: Compose output carries inference metadata only when drift handling produced it.
- [ ] R3: Existing canonical repositories continue to load without requiring inference metadata.

## Acceptance Criteria
- [ ] AC1: Type contracts expose inference data to validation and UI code.
- [ ] AC2: Canonical repositories without inferred edges preserve existing output shape except for optional metadata.
- [ ] AC3: Tests cover absence and presence of inferred-edge metadata.

## Dependencies
- S-0504
- T-0501

## Open Questions
- Should inference metadata live on composed nodes, edge records, or a separate projection metadata section?

## Notes
This task turns the shared inference contract into implementation-facing runtime data.
