# Metrics and Cost Modeling Baseline

## ID
F-0402

## Type
Feature

## Parent
E-0004

## Summary
2. **Feature B: Metrics and Cost Modeling Baseline** 
 Core performance metrics with required fees/slippage treatment.

## Problem / Context
Migrated from BitBetMatic Epic 0004.

## Goals
- 2. **Feature B: Metrics and Cost Modeling Baseline** 
 Core performance metrics with required fees/slippage treatment.

## Non-goals
- None

## Requirements
- **Feature B: Metrics and Cost Modeling Baseline**
- Core performance metrics with required fees/slippage treatment.

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
