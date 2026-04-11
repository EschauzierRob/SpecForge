# Transparent Ranking and Candidate Comparison

## ID
F-0403

## Type
Feature

## Parent
E-0004

## Summary
3. **Feature C: Transparent Ranking and Candidate Comparison** 
 Winner + top-N + metric contribution breakdown.

## Problem / Context
Migrated from BitBetMatic Epic 0004.

## Goals
- 3. **Feature C: Transparent Ranking and Candidate Comparison** 
 Winner + top-N + metric contribution breakdown.

## Non-goals
- None

## Requirements
- **Feature C: Transparent Ranking and Candidate Comparison**
- Winner + top-N + metric contribution breakdown.

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
