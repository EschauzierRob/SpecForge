# Plan — Epic 0004

1. Lock deterministic run envelope and replay schema requirements.
2. Implement deterministic backtest execution path and persist run snapshots.
3. Compute and persist metric outputs, explicitly including fee/slippage-adjusted values.
4. Implement ranking logic that outputs winner and persisted top-N with metric contribution breakdown.
5. Generate structured explainability artifacts (winner-vs-alternatives + guardrail outcomes).
6. Add deterministic replay tests validating metric equality and ranking-order equality.
## Current slice

- Execute `RankStrategies` after `RunBacktests` using a deterministic per-run `risk_adjusted_v1` policy.
- Persist candidate-level ranking artifacts, winner + top-5 decision output, and structured disqualification/why-winner reasoning.
- Surface ranking state in the read models and dashboard while keeping older unranked runs readable.
