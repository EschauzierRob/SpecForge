# Map Drift Findings into Validation Output

## ID
T-0508

## Type
Task

## Parent
S-0507

## Summary
Map inferred-structure drift categories into validation findings compatible with existing warning surfaces.

## Problem / Context
Drift warnings need to appear through the same validation output users already rely on for triage.

## Goals
- Add validation finding mappings for drift categories.
- Include actionable remediation guidance.
- Preserve existing validation output compatibility.

## Non-goals
- Adding a separate drift-only API endpoint.

## Requirements
- [ ] R1: Validation emits findings for missing level, synthesized level, skipped level, orphan node, ambiguous parent, and low-confidence inferred edge.
- [ ] R2: Findings include stable rule IDs, severity, source paths, affected spec IDs, and remediation hints.
- [ ] R3: Warnings-panel tests cover drift finding display and filtering.

## Acceptance Criteria
- [ ] AC1: Drift findings are visible from existing validation CLI/API output.
- [ ] AC2: Warnings panel can display drift findings without losing severity or rule ID filtering.
- [ ] AC3: Fixture tests assert expected finding codes and messages.

## Dependencies
- S-0507
- T-0502
- T-0507

## Open Questions
- Should drift warning rule IDs use a new `V-2xx` range or extend existing overlay/canonical rule ranges?

## Notes
Implementation task for surfacing drift diagnostics through validation.
