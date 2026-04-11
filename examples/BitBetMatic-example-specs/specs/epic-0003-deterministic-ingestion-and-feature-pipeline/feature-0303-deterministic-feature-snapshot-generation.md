# Deterministic Feature Snapshot Generation

## ID
F-0303

## Type
Feature

## Parent
E-0003

## Summary
3. **Feature C: Deterministic Feature Snapshot Generation** 
 Versioned feature computation with stable outputs from stable normalized inputs.

## Problem / Context
Migrated from BitBetMatic Epic 0003.

## Goals
- 3. **Feature C: Deterministic Feature Snapshot Generation** 
 Versioned feature computation with stable outputs from stable normalized inputs.

## Non-goals
- None

## Requirements
- **Feature C: Deterministic Feature Snapshot Generation**
- Versioned feature computation with stable outputs from stable normalized inputs.

## Acceptance Criteria
- Re-running ingestion on the same source interval does not create duplicate candle identities.
- Re-running feature computation on unchanged normalized candles and unchanged feature-set version yields identical feature snapshots.
- Deterministic fixtures replay representative ingestion/feature edge cases with stable outputs across at least two consecutive reruns.
- Pipeline stages are explicit, named, and auditable through logs and persisted run metadata.
- Missing candle intervals are surfaced with explicit handling outcome (`blocked` or `accepted_with_gap_markers`).

## Dependencies
- E-0003

## Open Questions
- None

## Notes
- Original feature material archived under legacy-specs/0003-deterministic-ingestion-and-feature-pipeline.
