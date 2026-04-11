# Deterministic Backtest Run Core

## ID
F-0401

## Type
Feature

## Parent
E-0004

## Summary
1. **Feature A: Deterministic Backtest Run Core** 
 Stable evaluation loop + persisted run context snapshot.

## Problem / Context
Migrated from BitBetMatic Epic 0004.

## Goals
- 1. **Feature A: Deterministic Backtest Run Core** 
 Stable evaluation loop + persisted run context snapshot.

## Non-goals
- None

## Requirements
- **Feature A: Deterministic Backtest Run Core**
- Stable evaluation loop + persisted run context snapshot.

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
