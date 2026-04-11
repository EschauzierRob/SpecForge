# Backtest and Ranking Explainability

## ID
E-0004

## Type
Epic

## Parent
None

## Summary
Epic 0004 converts deterministic data and feature outputs into deterministic candidate evaluation and transparent selection.

## Problem / Context
Epic 0004 converts deterministic data and feature outputs into deterministic candidate evaluation and transparent selection.

## Goals
- Deliver a deterministic backtest-and-ranking flow that persists both outcomes and reasoning, including why the selected candidate beat alternatives and why disqualified candidates were rejected.

## Non-goals
- Complex optimization frameworks or hyperparameter search engines.
- Live execution routing.
- Advanced portfolio-level allocation systems.
- UI-heavy analytics beyond minimum operator/developer visibility needs.

## Requirements
- Deterministic backtest execution from persisted candles/features and explicit config snapshots.
- Inclusion of fees and slippage assumptions from day one.
- Persistence of run inputs, configuration, and evaluation outputs.
- Ranking with top-N candidate exposure (not winner only).
- Score breakdowns by contributing metrics.
- Explainability artifacts that show why A won over B/C.
- Guardrail disqualification visibility.
- Ranking is invalid unless it includes both winner and an explicit top-N list where N is configured and persisted per run.
- Explainability artifacts must include machine-usable structured fields; prose-only output is insufficient.
- Every candidate must have either (a) ranked score evidence or (b) disqualification reason(s); "dropped silently" is invalid.
- Cost assumptions (fees/slippage) must be stored in run snapshots and reflected in persisted metric outputs.
- Deterministic replay comparison target must be defined up front: metric values and ranking order are strict-equality gates.

## Acceptance Criteria
- Same run inputs/config produce identical backtest metric values and ranking order.
- Each run persists an inspectable snapshot of dataset references, strategy parameters, window, and cost assumptions.
- Ranking output includes winner + top-N candidates with per-metric score breakdown.
- Explainability artifacts explicitly state differentiators between winner and alternatives plus disqualification reasons.
- Fees/slippage assumptions are included and visible in evaluation records.

## Dependencies
- E-0003

## Open Questions
- How should future slices expose ranking/version policy drift across historical runs?
- Which additional performance metrics, if any, should graduate from descriptive fields into future ranking inputs?

## Notes
- Migrated from legacy-specs/0004-backtest-and-ranking-explainability/spec.md.
- Archived decisions.md under legacy-specs/0004-backtest-and-ranking-explainability.
- Archived clarifications.md under legacy-specs/0004-backtest-and-ranking-explainability.
- Archived plan.md under legacy-specs/0004-backtest-and-ranking-explainability.
