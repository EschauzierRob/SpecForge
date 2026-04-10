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

## Non-goals
- Auto-resolving ambiguity through destructive assumptions.

## Requirements
- [ ] R1: Each inferred relationship is assigned high, medium, or low confidence.
- [ ] R2: Validation rules detect missing hierarchy levels, mixed naming conventions, orphan nodes, and ambiguous parents.
- [ ] R3: Findings include machine-readable type, severity, and references to affected spec IDs/files.

## Acceptance Criteria
- [ ] AC1: Low-confidence edges create warnings that can be filtered and triaged.
- [ ] AC2: Drift findings clearly distinguish parser errors from inferred-structure ambiguity.
- [ ] AC3: Validation output can be consumed unchanged by existing warnings panel contracts.

## Dependencies
- F-0015
- F-0011

## Open Questions
- Should ambiguous parent findings be warning severity by default or elevated to error for strict modes?

## Notes
Implements epic requirements R3 and R5.
