1. Freeze the new deterministic feature set contract: `core_trend` / `v3` with SMA, EMA, RSI, ATR percentage, and return volatility.
2. Extend strategy evaluation with richer signal context while preserving next-candle-open execution semantics.
3. Add the fixed `TrendPullbackRegime` candidate family beside the SMA benchmark family.
4. Persist descriptive trade-quality diagnostics in candidate metrics JSON.
5. Extend trace/read-model/dashboard surfaces so the new indicators and diagnostics are inspectable.
6. Add deterministic regression tests for feature outputs, signal behavior, and candidate-quality comparisons on synthetic fixtures.
