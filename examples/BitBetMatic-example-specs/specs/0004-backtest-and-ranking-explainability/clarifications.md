# Clarifications — Epic 0004

## Resolved
- Explainability is a first-class requirement and part of definition of done.
- Ranking outputs must include top-N and score breakdowns, not just the winning candidate.
- Fees and slippage are baseline modeling assumptions and cannot be deferred.
- Candidates cannot be silently dropped: each candidate must have scored evidence or explicit disqualification evidence.
- Deterministic replay gate is strict for metric values and ranking order.
- The first delivery slice stops before ranking and explainability artifacts; it must still persist replayable run snapshots and per-candidate metrics.
- The first real strategy family is SMA crossover with an optional volatility filter, using the existing `sma_close_5`, `sma_close_20`, and `volatility_return_std_20` features.
- Replay decisions are taken from the completed candle/feature state at time `T` and executed at the next candle open to avoid same-candle lookahead.
- The initial ranking scope is per backtest run, not cross-run.
- The v1 ranking policy is `risk_adjusted_v1`.
- The v1 top-N persistence default is 5.
- The v1 quality gates are: net return must be positive, trade count must be at least 10, and max drawdown must be at most 35%.
- If all candidates are disqualified, the ranking stage still succeeds and persists a no-winner decision artifact.

## Open questions
- Which future metrics should graduate into ranking inputs after `risk_adjusted_v1`?
- How should future slices expose policy/version drift across historical ranked runs?
