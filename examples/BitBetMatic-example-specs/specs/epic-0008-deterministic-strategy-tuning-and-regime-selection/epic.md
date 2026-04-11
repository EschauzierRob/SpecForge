# Deterministic Strategy Tuning and Regime-Aware Selection

## ID
E-0008

## Type
Epic

## Parent
None

## Summary
Epic 0008 focuses on improving candidate reliability by condition rather than pretending one global strategy should perform well in every market state.

## Problem / Context
Epic 0008 focuses on improving candidate reliability by condition rather than pretending one global strategy should perform well in every market state.

## Goals
- Deliver a deterministic tuning-and-selection slice that:
- expands the candidate set from a few hand-picked variants to a small bounded parameter grid,
- classifies market conditions using the existing `core_trend` feature set,
- persists per-condition candidate performance,
- selects per-condition winners plus an overall fallback winner,
- surfaces those artifacts in the API and dashboard.

## Non-goals
- Broad hyperparameter search or optimizer loops.
- Machine-learning regime detection or adaptive online learning.
- Cross-run normalization of winners.
- Paper trading or live execution changes.

## Requirements
- Rule-based market-condition classification using existing EMA, ATR, RSI, and volatility features.
- Bounded deterministic candidate-grid generation for the SMA and TrendPullbackRegime families.
- Per-condition performance breakdowns persisted inside existing candidate metrics artifacts.
- A new deterministic `SelectPerConditionWinners` pipeline stage after overall ranking.
- Dashboard/read-model support for condition winners, fallback winner, and candidate condition metrics.
- Trace projection support for hovered condition labels and active rule-cluster context.
- The slice remains deterministic, long-only, and bounded.
- Candidate generation must stay reviewable and stable in size.
- Existing overall ranking guardrails remain intact.
- Per-condition selection must not force a winner when every candidate is disqualified for that condition.
- Older runs without condition artifacts must remain readable.

## Acceptance Criteria
- The platform generates a stable bounded candidate grid with deterministic candidate keys.
- Replay produces stable market-condition labels and per-condition metrics for every run.
- The platform persists per-condition winners and an overall fallback winner without schema churn.
- Dashboard views let the team inspect candidate behavior by condition rather than only by whole-run loss.
- Synthetic fixtures show better condition-local differentiation, especially lower churn in choppy conditions.

## Dependencies
- E-0007

## Open Questions
- None

## Notes
- Migrated from legacy-specs/0008-deterministic-strategy-tuning-and-regime-selection/spec.md.
- Archived plan.md under legacy-specs/0008-deterministic-strategy-tuning-and-regime-selection.
