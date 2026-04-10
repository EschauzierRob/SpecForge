# Emit Drift Findings Through Validation

## ID
S-0507

## Type
Story

## Parent
F-0016

## Summary
As a planning user, I can see structural drift findings in the existing validation warning flow so I can triage inferred or ambiguous structure.

## Problem / Context
Drift diagnostics should not become a separate reporting channel if existing validation findings and warning panels can carry the information.

## Goals
- Map drift categories into validation findings.
- Preserve affected spec IDs, source paths, and inferred-edge targets.
- Keep output compatible with existing warning UI contracts.

## Non-goals
- Creating a separate drift-only diagnostics panel.

## Requirements
- [ ] R1: Validation emits findings for missing levels, synthesized levels, skipped levels, orphan nodes, ambiguous parents, and low-confidence inferred edges.
- [ ] R2: Findings include stable rule IDs, severity, message, source paths, affected spec IDs, and remediation guidance.
- [ ] R3: Existing warnings-panel consumers can display drift findings without contract changes unless navigation metadata is explicitly added.

## Acceptance Criteria
- [ ] AC1: Drift findings appear alongside existing validation findings.
- [ ] AC2: Ambiguous-parent and orphan-node findings include enough context to identify affected artifacts.
- [ ] AC3: Warning output remains deterministic for fixture scenarios.

## Dependencies
- F-0016
- S-0506
- F-0011

## Open Questions
- Should navigation metadata require an extension to validation findings, or can existing `specId` and `sourcePaths` fields cover MVP navigation?

## Notes
This story connects confidence and drift taxonomy to user-facing validation output.
