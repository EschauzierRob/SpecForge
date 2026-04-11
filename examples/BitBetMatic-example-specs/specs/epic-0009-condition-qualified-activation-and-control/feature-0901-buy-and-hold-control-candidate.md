# Buy-And-Hold Control Candidate

## ID
F-0901

## Type
Feature

## Parent
E-0009

## Summary
The goal is to stay honest about poor global performance while still allowing the system to identify narrow, condition-local footholds that are worth activating. This epic also adds a fully in-market buy-and-hold benchmark candidate to every run so tuned candidates can be compared against simply staying long.

## Problem / Context
Migrated from BitBetMatic Epic 0009.

## Goals
- The goal is to stay honest about poor global performance while still allowing the system to identify narrow, condition-local footholds that are worth activating. This epic also adds a fully in-market buy-and-hold benchmark candidate to every run so tuned candidates can be compared against simply staying long.

## Non-goals
- None

## Requirements
- Epic 0009 adds a second decision layer on top of whole-run ranking: condition-qualified activation.
- The goal is to stay honest about poor global performance while still allowing the system to identify narrow, condition-local footholds that are worth activating. This epic also adds a fully in-market buy-and-hold benchmark candidate to every run so tuned candidates can be compared against simply staying long.
- Deliver a deterministic slice that:
- keeps whole-run ranking as the truth/reporting layer,
- adds condition-local activation with explicit safety rails,
- persists `stay_flat` when no candidate qualifies for a condition,
- includes a buy-and-hold control candidate in every backtest run,
- surfaces activation and benchmark comparisons in the dashboard.

## Acceptance Criteria
- Every backtest run includes `Control Buy And Hold`.
- Activation artifacts identify which conditions have an active candidate and which remain flat.
- Candidates can be globally disqualified yet still appear as locally activation-qualified if they pass the activation gates.
- Dashboard pages show whether a candidate beats or lags the control candidate.

## Dependencies
- E-0009

## Open Questions
- None

## Notes
- Original feature material archived under legacy-specs/0009-condition-qualified-activation-and-control.
