# 0009 - Condition-Qualified Activation And Buy-And-Hold Control

## Overview
Epic 0009 adds a second decision layer on top of whole-run ranking: condition-qualified activation.

The goal is to stay honest about poor global performance while still allowing the system to identify narrow, condition-local footholds that are worth activating. This epic also adds a fully in-market buy-and-hold benchmark candidate to every run so tuned candidates can be compared against simply staying long.

## Objective
Deliver a deterministic slice that:
- keeps whole-run ranking as the truth/reporting layer,
- adds condition-local activation with explicit safety rails,
- persists `stay_flat` when no candidate qualifies for a condition,
- includes a buy-and-hold control candidate in every backtest run,
- surfaces activation and benchmark comparisons in the dashboard.

## Scope
### In scope
- New `SelectConditionActivations` pipeline stage after `SelectPerConditionWinners`.
- Buy-and-hold control evaluator added to the deterministic strategy catalog.
- Per-condition activation gates using local positive net return plus global safety rails.
- Persisted activation artifacts in existing `SelectionDecisionRecord` storage.
- Dashboard/read-model support for:
  - activated conditions,
  - stay-flat conditions,
  - control-candidate comparisons,
  - control-candidate traces.

### Out of scope
- Paper trading or live execution changes.
- Cross-run activation logic.
- Relaxing whole-run ranking guardrails.
- Any claim that condition-local activation already proves end-to-end profitability.

## Hard constraints
- The slice remains deterministic, long-only, bounded, and reviewable.
- The control candidate uses the same replay, fee, slippage, and trace rules as other candidates.
- If no candidate qualifies for a condition, the system must explicitly persist `stay_flat`.
- Whole-run ranking and condition-local activation remain separate concerns.

## Success criteria
- Every backtest run includes `Control Buy And Hold`.
- Activation artifacts identify which conditions have an active candidate and which remain flat.
- Candidates can be globally disqualified yet still appear as locally activation-qualified if they pass the activation gates.
- Dashboard pages show whether a candidate beats or lags the control candidate.
