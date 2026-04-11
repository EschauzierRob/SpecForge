# Strategy Profitability Baseline Uplift

## ID
E-0007

## Type
Epic

## Parent
None

## Summary
Epic 0007 focuses on improving the baseline quality of deterministic strategy candidates before any paper-trading runtime is allowed to depend on them.

## Problem / Context
Epic 0007 focuses on improving the baseline quality of deterministic strategy candidates before any paper-trading runtime is allowed to depend on them.

## Goals
- Deliver a deterministic feature-and-strategy uplift that expands beyond the current SMA-only baseline, adds trend/regime context, and exposes trade-quality diagnostics that help the team judge whether candidate quality is improving after costs.

## Non-goals
- Hyperparameter search or large parameter grids.
- Shorting, leverage, or portfolio allocation logic.
- Cross-run ranking normalization changes.
- Paper trading or live execution work.

## Requirements
- Expand the deterministic feature set to include EMA, RSI, and ATR percentage alongside the existing SMA and volatility features.
- Introduce richer deterministic signal context for strategy evaluation.
- Keep the existing SMA family as an explicit benchmark.
- Add one new fixed-variant long-only strategy family: `TrendPullbackRegime`.
- Persist additional trade-quality diagnostics per candidate.
- Extend read models and dashboard pages so candidate quality can be inspected more directly.
- The slice remains deterministic, fixed-variant, and long-only.
- Ranking policy from Epic 0004 remains unchanged, including the positive-net guardrail.
- Strategy trace replay must continue to share the same execution semantics as aggregate backtesting.
- New diagnostics are descriptive only; they are not new ranking inputs in this slice.

## Acceptance Criteria
- The platform persists the `core_trend` / `v3` feature set with stable deterministic outputs.
- At least one `TrendPullbackRegime` candidate is net positive on the strong-uptrend synthetic fixture after costs.
- On a choppy synthetic fixture, the new family trades less and incurs lower total cost than the SMA benchmark.
- Dashboard candidate views expose the new trade-quality diagnostics without breaking older runs.
- Trace replay shows strategy-relevant indicator context for both legacy SMA and new trend/regime candidates.

## Dependencies
- E-0006

## Open Questions
- None

## Notes
- Migrated from legacy-specs/0007-strategy-profitability-baseline-uplift/spec.md.
- Archived plan.md under legacy-specs/0007-strategy-profitability-baseline-uplift.
