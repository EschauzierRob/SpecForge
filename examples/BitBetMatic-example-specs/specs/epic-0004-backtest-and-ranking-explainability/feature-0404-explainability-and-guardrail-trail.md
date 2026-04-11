# Explainability and Guardrail Trail

## ID
F-0404

## Type
Feature

## Parent
E-0004

## Summary
4. **Feature D: Explainability and Guardrail Trail** 
 Structured reasoning and disqualification artifacts for operator/developer audit.

## Problem / Context
Migrated from BitBetMatic Epic 0004.

## Goals
- 4. **Feature D: Explainability and Guardrail Trail** 
 Structured reasoning and disqualification artifacts for operator/developer audit.

## Non-goals
- None

## Requirements
- **Feature D: Explainability and Guardrail Trail**
- Structured reasoning and disqualification artifacts for operator/developer audit.
- Epic 0004 is completed through deterministic backtest execution, per-run ranking, winner/top-N persistence, and explainability artifacts.
- The current ranking policy is `risk_adjusted_v1` over persisted per-candidate metrics within a single backtest run.
- Guardrail outcomes, score breakdowns, and winner-vs-alternative artifacts are now part of the persisted selection decision trail.

## Acceptance Criteria
- Same run inputs/config produce identical backtest metric values and ranking order.
- Each run persists an inspectable snapshot of dataset references, strategy parameters, window, and cost assumptions.
- Ranking output includes winner + top-N candidates with per-metric score breakdown.
- Explainability artifacts explicitly state differentiators between winner and alternatives plus disqualification reasons.
- Fees/slippage assumptions are included and visible in evaluation records.

## Dependencies
- E-0004

## Open Questions
- None

## Notes
- Original feature material archived under legacy-specs/0004-backtest-and-ranking-explainability.
