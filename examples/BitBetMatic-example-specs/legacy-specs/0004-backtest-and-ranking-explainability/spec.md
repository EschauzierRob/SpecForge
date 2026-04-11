# 0004 — Backtest and Ranking Explainability

## Overview
Epic 0004 converts deterministic data and feature outputs into deterministic candidate evaluation and transparent selection.

This epic is not merely “run backtests and pick a winner.” It requires every selection outcome to be explainable, reproducible, and inspectable.

## Objective
Deliver a deterministic backtest-and-ranking flow that persists both outcomes and reasoning, including why the selected candidate beat alternatives and why disqualified candidates were rejected.

## Scope
### In scope
- Deterministic backtest execution from persisted candles/features and explicit config snapshots.
- Inclusion of fees and slippage assumptions from day one.
- Persistence of run inputs, configuration, and evaluation outputs.
- Ranking with top-N candidate exposure (not winner only).
- Score breakdowns by contributing metrics.
- Explainability artifacts that show why A won over B/C.
- Guardrail disqualification visibility.

### Out of scope
- Complex optimization frameworks or hyperparameter search engines.
- Live execution routing.
- Advanced portfolio-level allocation systems.
- UI-heavy analytics beyond minimum operator/developer visibility needs.

## Hard constraints (non-negotiable)
- Ranking is invalid unless it includes both winner and an explicit top-N list where N is configured and persisted per run.
- Explainability artifacts must include machine-usable structured fields; prose-only output is insufficient.
- Every candidate must have either (a) ranked score evidence or (b) disqualification reason(s); “dropped silently” is invalid.
- Cost assumptions (fees/slippage) must be stored in run snapshots and reflected in persisted metric outputs.
- Deterministic replay comparison target must be defined up front: metric values and ranking order are strict-equality gates.

## Success criteria
- Same run inputs/config produce identical backtest metric values and ranking order.
- Each run persists an inspectable snapshot of dataset references, strategy parameters, window, and cost assumptions.
- Ranking output includes winner + top-N candidates with per-metric score breakdown.
- Explainability artifacts explicitly state differentiators between winner and alternatives plus disqualification reasons.
- Fees/slippage assumptions are included and visible in evaluation records.

## Failure criteria
- Winner is persisted without transparent “why” evidence.
- Run outputs cannot be reconstructed from persisted data.
- Fees/slippage are omitted, hidden, or inconsistent with metric calculations.
- Guardrail disqualification reasons are unavailable or ambiguous.
- Ranking logic changes cannot be audited between runs.

## Architectural impact
- Extends backtesting module from stub behavior to deterministic evaluation runtime.
- Deepens persistence usage for run snapshots, metric outputs, and reasoning artifacts.
- Defines selection transparency contracts consumed later by paper-trading operators.
- Creates a deterministic decision trail required for governance and trust.

## Risks
- Explainability payloads may become too vague to be useful.
- Early scoring model may overfit to convenience metrics.
- Inconsistent treatment of fees/slippage can invalidate comparisons.
- Overly broad first iteration can delay delivery.

## Open questions
- How should future slices expose ranking/version policy drift across historical runs?
- Which additional performance metrics, if any, should graduate from descriptive fields into future ranking inputs?

## Implementation order
1. Lock deterministic run envelope and persisted snapshot schema.
2. Implement deterministic backtest runner with persisted inputs/outputs.
3. Implement fee/slippage-adjusted metrics as baseline outputs.
4. Implement ranking output (winner + top-N + metric breakdown).
5. Implement explainability artifacts and disqualification trail.
6. Add replay/regression tests as release gate for determinism and transparency.

## Initial feature decomposition
1. **Feature A: Deterministic Backtest Run Core**  
   Stable evaluation loop + persisted run context snapshot.
2. **Feature B: Metrics and Cost Modeling Baseline**  
   Core performance metrics with required fees/slippage treatment.
3. **Feature C: Transparent Ranking and Candidate Comparison**  
   Winner + top-N + metric contribution breakdown.
4. **Feature D: Explainability and Guardrail Trail**  
   Structured reasoning and disqualification artifacts for operator/developer audit.

## Current slice focus
- Epic 0004 is completed through deterministic backtest execution, per-run ranking, winner/top-N persistence, and explainability artifacts.
- The current ranking policy is `risk_adjusted_v1` over persisted per-candidate metrics within a single backtest run.
- Guardrail outcomes, score breakdowns, and winner-vs-alternative artifacts are now part of the persisted selection decision trail.
