# 0008 - Deterministic Strategy Tuning and Regime-Aware Selection

## Overview
Epic 0008 focuses on improving candidate reliability by condition rather than pretending one global strategy should perform well in every market state.

This epic keeps the system honest. It does not guarantee profitability. It aims to produce a bounded deterministic candidate set, classify market conditions from existing features, and answer which candidate is most reliable for a detected condition under the current fee/slippage model.

## Objective
Deliver a deterministic tuning-and-selection slice that:
- expands the candidate set from a few hand-picked variants to a small bounded parameter grid,
- classifies market conditions using the existing `core_trend` feature set,
- persists per-condition candidate performance,
- selects per-condition winners plus an overall fallback winner,
- surfaces those artifacts in the API and dashboard.

## Scope
### In scope
- Rule-based market-condition classification using existing EMA, ATR, RSI, and volatility features.
- Bounded deterministic candidate-grid generation for the SMA and TrendPullbackRegime families.
- Per-condition performance breakdowns persisted inside existing candidate metrics artifacts.
- A new deterministic `SelectPerConditionWinners` pipeline stage after overall ranking.
- Dashboard/read-model support for condition winners, fallback winner, and candidate condition metrics.
- Trace projection support for hovered condition labels and active rule-cluster context.

### Out of scope
- Broad hyperparameter search or optimizer loops.
- Machine-learning regime detection or adaptive online learning.
- Cross-run normalization of winners.
- Paper trading or live execution changes.

## Hard constraints
- The slice remains deterministic, long-only, and bounded.
- Candidate generation must stay reviewable and stable in size.
- Existing overall ranking guardrails remain intact.
- Per-condition selection must not force a winner when every candidate is disqualified for that condition.
- Older runs without condition artifacts must remain readable.

## Success criteria
- The platform generates a stable bounded candidate grid with deterministic candidate keys.
- Replay produces stable market-condition labels and per-condition metrics for every run.
- The platform persists per-condition winners and an overall fallback winner without schema churn.
- Dashboard views let the team inspect candidate behavior by condition rather than only by whole-run loss.
- Synthetic fixtures show better condition-local differentiation, especially lower churn in choppy conditions.

## Risks
- A larger candidate set can add noise if condition metrics are not clearly surfaced.
- Weak condition rules can create false confidence if labels are too coarse or unstable.
- Per-condition returns can be misread as additive performance if not presented carefully.

## Current slice focus
- Replace hand-picked variants with a bounded deterministic parameter grid.
- Add rule-based regime classification inside shared replay.
- Persist per-condition candidate metrics and a condition-aware selection artifact.
- Extend the dashboard so candidate reliability is inspectable per condition.
