# Trend Feature Set

## ID
F-0701

## Type
Feature

## Parent
E-0007

## Summary
This epic is intentionally honest in scope. It does not promise profitability. It aims to produce candidates that are less churn-heavy, more selective, and more likely to survive the existing fee/slippage model with positive net outcomes.

## Problem / Context
Migrated from BitBetMatic Epic 0007.

## Goals
- This epic is intentionally honest in scope. It does not promise profitability. It aims to produce candidates that are less churn-heavy, more selective, and more likely to survive the existing fee/slippage model with positive net outcomes.

## Non-goals
- None

## Requirements
- Epic 0007 focuses on improving the baseline quality of deterministic strategy candidates before any paper-trading runtime is allowed to depend on them.
- This epic is intentionally honest in scope. It does not promise profitability. It aims to produce candidates that are less churn-heavy, more selective, and more likely to survive the existing fee/slippage model with positive net outcomes.
- Deliver a deterministic feature-and-strategy uplift that expands beyond the current SMA-only baseline, adds trend/regime context, and exposes trade-quality diagnostics that help the team judge whether candidate quality is improving after costs.
- Expand the deterministic feature set to include EMA, RSI, and ATR percentage alongside the existing SMA and volatility features.
- Introduce richer deterministic signal context for strategy evaluation.
- Keep the existing SMA family as an explicit benchmark.
- Add one new fixed-variant long-only strategy family: `TrendPullbackRegime`.
- Persist additional trade-quality diagnostics per candidate.

## Acceptance Criteria
- The platform persists the `core_trend` / `v3` feature set with stable deterministic outputs.
- At least one `TrendPullbackRegime` candidate is net positive on the strong-uptrend synthetic fixture after costs.
- On a choppy synthetic fixture, the new family trades less and incurs lower total cost than the SMA benchmark.
- Dashboard candidate views expose the new trade-quality diagnostics without breaking older runs.
- Trace replay shows strategy-relevant indicator context for both legacy SMA and new trend/regime candidates.

## Dependencies
- E-0007

## Open Questions
- None

## Notes
- Original feature material archived under legacy-specs/0007-strategy-profitability-baseline-uplift.
