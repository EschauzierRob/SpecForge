# Deterministic Ingestion and Feature Pipeline

## ID
E-0003

## Type
Epic

## Parent
None

## Summary
Epic 0003 defines the first production-meaningful data pipeline for BitBetMatic 2.0: ingesting historical market candles and producing feature snapshots in a deterministic, replayable, and auditable way.

## Problem / Context
Epic 0003 defines the first production-meaningful data pipeline for BitBetMatic 2.0: ingesting historical market candles and producing feature snapshots in a deterministic, replayable, and auditable way.

## Goals
- Deliver a deterministic ingestion + feature pipeline where identical inputs and configuration always produce identical persisted raw and derived outputs, without duplication, silent drift, or hidden data-quality gaps.

## Non-goals
- Multi-exchange abstraction beyond what is necessary for the Bitvavo slice.
- Advanced feature experimentation platform.
- Real-time streaming ingestion.
- Backtest ranking or candidate selection logic.
- Paper/live trade execution behavior.

## Requirements
- Deterministic historical candle ingestion for Bitvavo as the initial exchange slice.
- Deterministic batched historical candle retrieval for large Bitvavo date ranges using bounded API requests.
- Explicit stage boundaries for worker pipeline flow.
- Persistence of raw candles with idempotent import semantics.
- Canonical time normalization rules (UTC, timeframe alignment, boundary behavior).
- Missing-candle handling policy (gap detection + explicit handling behavior).
- Deterministic feature computation over normalized candle windows.
- Reproducible fixtures for ingestion and feature pipeline tests.
- The supported timeframe set for this epic must be explicitly enumerated in configuration/docs; wildcard "all timeframes" support is out of scope.
- Candle identity must be deterministic and unique per `(exchange, market, timeframe, open_time_utc)`.
- Historical retrieval must respect the upstream Bitvavo candles limit per request and split large ranges into deterministic batches.
- Pipeline audit metadata must use dedicated pipeline run/stage records; backtest persistence tables are not valid substitutes.
- Every pipeline run must persist run metadata including: run identifier, stage name, stage status, input reference(s), and feature-set version (when applicable).
- Gap handling must be explicit per run segment: either `blocked`, `accepted_with_gap_markers`, or `not_applicable`; silent continuation is invalid.

## Acceptance Criteria
- Re-running ingestion on the same source interval does not create duplicate candle identities.
- Re-running feature computation on unchanged normalized candles and unchanged feature-set version yields identical feature snapshots.
- Deterministic fixtures replay representative ingestion/feature edge cases with stable outputs across at least two consecutive reruns.
- Pipeline stages are explicit, named, and auditable through logs and persisted run metadata.
- Missing candle intervals are surfaced with explicit handling outcome (`blocked` or `accepted_with_gap_markers`).
- Raw and derived data ownership is clear and reproducible from persisted records.

## Dependencies
- E-0002

## Open Questions
- Should blocked segments fail the entire run or mark partial-run status with explicit non-usable outputs?
- What is the minimum acceptable fixture matrix by timeframe before this epic can be marked done?
- How should late-arriving historical corrections be represented without breaking auditability?

## Notes
- Migrated from legacy-specs/0003-deterministic-ingestion-and-feature-pipeline/spec.md.
- Archived decisions.md under legacy-specs/0003-deterministic-ingestion-and-feature-pipeline.
- Archived clarifications.md under legacy-specs/0003-deterministic-ingestion-and-feature-pipeline.
- Archived plan.md under legacy-specs/0003-deterministic-ingestion-and-feature-pipeline.
