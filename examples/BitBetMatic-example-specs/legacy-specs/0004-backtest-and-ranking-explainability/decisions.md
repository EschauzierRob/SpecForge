# Decisions — Epic 0004

## D-0004-1
Backtest and ranking outputs are invalid unless accompanied by explainability artifacts.

## D-0004-2
Fees and slippage are mandatory baseline inputs in run evaluation, not optional post-processing.

## D-0004-3
Ranking must expose winner plus top-N candidates with score breakdowns.

## D-0004-4
Each run must persist a snapshot of relevant configuration and input references sufficient for deterministic replay.

## D-0004-5
Guardrail disqualification reasons are persisted as first-class ranking outputs.

## D-0004-6
The first implementation slice for Epic 0004 ships deterministic run execution and per-candidate persistence before ranking or explainability artifacts.

## D-0004-7
The initial real strategy family is a long/flat SMA crossover with fixed volatility-filter variants over the existing `core_minimal` feature set.

## D-0004-8
Backtest execution uses completed-candle decisions with next-candle-open fills as the deterministic anti-lookahead rule.

## D-0004-9
The first ranking policy is `risk_adjusted_v1`, applied within a single backtest run only.

## D-0004-10
The default persisted comparison set is winner plus top 5 eligible candidates.

## D-0004-11
The initial guardrail set disqualifies candidates with non-positive net return, fewer than 10 trades, or max drawdown above 35%.

## D-0004-12
If every candidate is disqualified, the ranking stage still succeeds and persists an explicit no-winner decision artifact.
