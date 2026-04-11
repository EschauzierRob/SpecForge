# Tasks - Epic 0004

- [x] Define deterministic backtest run schema (dataset refs, params, window, cost assumptions).
- [x] Implement deterministic run execution using persisted candles/features.
- [x] Persist run snapshots sufficient for deterministic replay.
- [x] Add fee/slippage assumptions to evaluation pipeline and persist them with outputs.
- [x] Persist core metric outputs for every candidate (including disqualified candidates where applicable).
- [x] Implement the first real strategy family: SMA crossover with fixed volatility-filter variants.
- [x] Add worker-stage integration so `RunBacktests` executes only after usable ingestion/feature stages.
- [x] Add candidate-level deterministic trade trace replay for operator/developer inspection of backtest outcomes.
- [x] Implement candidate ranking with persisted winner + top-N result set.
- [x] Add per-metric score contribution breakdowns to ranking artifacts.
- [x] Capture guardrail disqualification reason code + readable reason text.
- [x] Add structured winner-over-alternative explainability artifact generation.
- [x] Add deterministic replay tests for metric equality and ranking-order equality.
