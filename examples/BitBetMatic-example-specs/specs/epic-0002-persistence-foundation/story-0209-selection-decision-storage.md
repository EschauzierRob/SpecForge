# Selection Decision Storage

## ID
S-0209

## Type
Story

## Parent
F-0203

## Summary
As a system, I want to persist selection decisions so that chosen strategies are explainable and auditable.

## Problem / Context
Migrated from BitBetMatic Epic 0002.

## Goals
- As a system, I want to persist selection decisions so that chosen strategies are explainable and auditable.

## Non-goals
- None

## Requirements
- As a system, I want to persist selection decisions so that chosen strategies are explainable and auditable.
- Acceptance Criteria
- SelectionDecision:
- references:
- BacktestRun
- selected StrategyCandidate
- Stores:
- rationale summary (human-readable)

## Acceptance Criteria
- SelectionDecision:
- references:
- BacktestRun
- selected StrategyCandidate
- Stores:
- rationale summary (human-readable)
- optional structured reasoning data
- timestamp of decision
- Model supports:
- reconstructing why a candidate was chosen

## Dependencies
- F-0203

## Open Questions
- None

## Notes
- Original story material archived under legacy-specs/0002-persistence-foundation.
