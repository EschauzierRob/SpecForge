# Bounded Candidate Grid

## ID
F-0801

## Type
Feature

## Parent
E-0008

## Summary
This epic keeps the system honest. It does not guarantee profitability. It aims to produce a bounded deterministic candidate set, classify market conditions from existing features, and answer which candidate is most reliable for a detected condition under the current fee/slippage model.

## Problem / Context
Migrated from BitBetMatic Epic 0008.

## Goals
- This epic keeps the system honest. It does not guarantee profitability. It aims to produce a bounded deterministic candidate set, classify market conditions from existing features, and answer which candidate is most reliable for a detected condition under the current fee/slippage model.

## Non-goals
- None

## Requirements
- Epic 0008 focuses on improving candidate reliability by condition rather than pretending one global strategy should perform well in every market state.
- This epic keeps the system honest. It does not guarantee profitability. It aims to produce a bounded deterministic candidate set, classify market conditions from existing features, and answer which candidate is most reliable for a detected condition under the current fee/slippage model.
- Deliver a deterministic tuning-and-selection slice that:
- expands the candidate set from a few hand-picked variants to a small bounded parameter grid,
- classifies market conditions using the existing `core_trend` feature set,
- persists per-condition candidate performance,
- selects per-condition winners plus an overall fallback winner,
- surfaces those artifacts in the API and dashboard.

## Acceptance Criteria
- The platform generates a stable bounded candidate grid with deterministic candidate keys.
- Replay produces stable market-condition labels and per-condition metrics for every run.
- The platform persists per-condition winners and an overall fallback winner without schema churn.
- Dashboard views let the team inspect candidate behavior by condition rather than only by whole-run loss.
- Synthetic fixtures show better condition-local differentiation, especially lower churn in choppy conditions.

## Dependencies
- E-0008

## Open Questions
- None

## Notes
- Original feature material archived under legacy-specs/0008-deterministic-strategy-tuning-and-regime-selection.
