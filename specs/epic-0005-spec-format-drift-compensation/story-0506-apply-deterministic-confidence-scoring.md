# Apply Deterministic Confidence Scoring

## ID
S-0506

## Type
Story

## Parent
F-0016

## Summary
As a planner, I can see deterministic confidence bands for inferred relationships so I understand how strongly SpecForge trusts each edge.

## Problem / Context
Inferred structure can look authoritative unless every inferred relationship carries a repeatable confidence signal derived from evidence.

## Goals
- Convert inference evidence into high, medium, or low confidence.
- Keep scoring deterministic and unit-testable.
- Make low-confidence edges available to warning generation.

## Non-goals
- Machine-learning or probabilistic scoring in MVP.

## Requirements
- [ ] R1: Confidence scoring consumes the shared inference result contract.
- [ ] R2: Scoring rules define deterministic thresholds and tie-breaking.
- [ ] R3: Low-confidence inferred edges are marked for drift warning generation.

## Acceptance Criteria
- [ ] AC1: The same fixture produces the same confidence bands across repeated runs.
- [ ] AC2: Confidence output explains which evidence signals contributed to the band.
- [ ] AC3: Low-confidence edges are available to validation diagnostics.

## Dependencies
- F-0016
- S-0504

## Open Questions
- Should confidence output expose raw score components or only band plus rationale?

## Notes
This story narrows scoring to deterministic MVP behavior and defers pluggable scoring.
