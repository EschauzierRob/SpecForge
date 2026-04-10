# Confidence and Drift Diagnostics

## ID
F-0016

## Type
Feature

## Parent
E-0005

## Summary
Classify certainty of inferred links and expose structural drift diagnostics as first-class warnings.

## Problem / Context
Without confidence signals and drift diagnostics, inferred structure can look authoritative even when uncertain.

## Goals
- Score inferred relationships.
- Detect and report drift patterns that prevent canonical interpretation.
- Provide deterministic confidence bands that can be unit tested.
- Reuse existing validation and warnings-panel contracts where possible.

## Non-goals
- Auto-resolving ambiguity through destructive assumptions.
- Introducing non-deterministic or model-based scoring in MVP.

## Requirements
- [ ] R1: Each inferred relationship is assigned high, medium, or low confidence.
- [ ] R2: Validation rules detect missing hierarchy levels, mixed naming conventions, orphan nodes, and ambiguous parents.
- [ ] R3: Findings include machine-readable type, severity, and references to affected spec IDs/files.
- [ ] R4: Confidence scoring uses deterministic inputs from the inferred-edge evidence contract.
- [ ] R5: Warning codes distinguish at least missing level, synthesized level, skipped level, orphan node, ambiguous parent, and low-confidence edge.

## Acceptance Criteria
- [ ] AC1: Low-confidence edges create warnings that can be filtered and triaged.
- [ ] AC2: Drift findings clearly distinguish parser errors from inferred-structure ambiguity.
- [ ] AC3: Validation output can be consumed unchanged by existing warnings panel contracts.
- [ ] AC4: Fixture scenarios produce stable confidence and warning outputs across repeated runs.

## Dependencies
- F-0015
- F-0011

## Open Questions
- Should ambiguous parent findings be warning severity by default or elevated to error for strict modes?
- Should raw numeric confidence scores be public, or should only bands and rationale be exposed?

## Notes
Implements epic requirements R3 and R5.
