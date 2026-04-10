# Score and Report Structural Ambiguity

## ID
S-0502

## Type
Story

## Parent
F-0016

## Summary
As a planner, I can see which inferred relationships are uncertain and what drift issues were detected.

## Problem / Context
Inferred structure without uncertainty signals can mislead prioritization and dependency planning.

## Goals
- Attach confidence to inferred edges.
- Emit actionable warnings for drift categories.

## Non-goals
- Auto-resolving ambiguous relationships without user visibility.

## Requirements
- [ ] R1: Confidence is assigned to each inferred edge using deterministic scoring rules.
- [ ] R2: Drift findings are emitted with consistent codes and severity levels.

## Acceptance Criteria
- [ ] AC1: Low-confidence edges appear in warning outputs.
- [ ] AC2: Orphan and ambiguous-parent findings include enough context to triage quickly.

## Dependencies
- F-0010
- F-0011

## Open Questions
- Do we need separate warning codes for "missing level synthesized" vs "missing level skipped"?

## Notes
Story focused on diagnostics and confidence outputs.
