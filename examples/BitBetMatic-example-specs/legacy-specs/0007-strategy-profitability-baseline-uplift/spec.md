# 0007 - Strategy Profitability Baseline Uplift

## Overview
Epic 0007 focuses on improving the baseline quality of deterministic strategy candidates before any paper-trading runtime is allowed to depend on them.

This epic is intentionally honest in scope. It does not promise profitability. It aims to produce candidates that are less churn-heavy, more selective, and more likely to survive the existing fee/slippage model with positive net outcomes.

## Objective
Deliver a deterministic feature-and-strategy uplift that expands beyond the current SMA-only baseline, adds trend/regime context, and exposes trade-quality diagnostics that help the team judge whether candidate quality is improving after costs.

## Scope
### In scope
- Expand the deterministic feature set to include EMA, RSI, and ATR percentage alongside the existing SMA and volatility features.
- Introduce richer deterministic signal context for strategy evaluation.
- Keep the existing SMA family as an explicit benchmark.
- Add one new fixed-variant long-only strategy family: `TrendPullbackRegime`.
- Persist additional trade-quality diagnostics per candidate.
- Extend read models and dashboard pages so candidate quality can be inspected more directly.

### Out of scope
- Hyperparameter search or large parameter grids.
- Shorting, leverage, or portfolio allocation logic.
- Cross-run ranking normalization changes.
- Paper trading or live execution work.

## Hard constraints
- The slice remains deterministic, fixed-variant, and long-only.
- Ranking policy from Epic 0004 remains unchanged, including the positive-net guardrail.
- Feature snapshots remain versioned and idempotent.
- Strategy trace replay must continue to share the same execution semantics as aggregate backtesting.
- New diagnostics are descriptive only; they are not new ranking inputs in this slice.

## Success criteria
- The platform persists the `core_trend` / `v3` feature set with stable deterministic outputs.
- At least one `TrendPullbackRegime` candidate is net positive on the strong-uptrend synthetic fixture after costs.
- On a choppy synthetic fixture, the new family trades less and incurs lower total cost than the SMA benchmark.
- Dashboard candidate views expose the new trade-quality diagnostics without breaking older runs.
- Trace replay shows strategy-relevant indicator context for both legacy SMA and new trend/regime candidates.

## Risks
- Additional indicators can add complexity without improving net outcomes if the family still overtrades.
- Signal-context changes could accidentally diverge replay and trace behavior if not shared through one core.
- New diagnostics may be misread as guarantees rather than descriptive evidence.

## Current slice focus
- Expand deterministic features from `core_minimal v1` to `core_trend v3`.
- Add the `TrendPullbackRegime` family while preserving SMA crossover as a benchmark.
- Persist and display candidate trade-quality diagnostics: win rate, average net trade, average holding candles, and time in market.
