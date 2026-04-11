# 0003 — Deterministic Ingestion and Feature Pipeline

## Overview
Epic 0003 defines the first production-meaningful data pipeline for BitBetMatic 2.0: ingesting historical market candles and producing feature snapshots in a deterministic, replayable, and auditable way.

This epic is not just “fetch candles and compute indicators.” It establishes the product's trust boundary for all downstream ranking and execution decisions.

## Objective
Deliver a deterministic ingestion + feature pipeline where identical inputs and configuration always produce identical persisted raw and derived outputs, without duplication, silent drift, or hidden data-quality gaps.

## Scope
### In scope
- Deterministic historical candle ingestion for Bitvavo as the initial exchange slice.
- Deterministic batched historical candle retrieval for large Bitvavo date ranges using bounded API requests.
- Explicit stage boundaries for worker pipeline flow.
- Persistence of raw candles with idempotent import semantics.
- Canonical time normalization rules (UTC, timeframe alignment, boundary behavior).
- Missing-candle handling policy (gap detection + explicit handling behavior).
- Deterministic feature computation over normalized candle windows.
- Reproducible fixtures for ingestion and feature pipeline tests.
- Raw-vs-derived source-of-truth boundaries documented and enforced in pipeline design.

### Out of scope
- Multi-exchange abstraction beyond what is necessary for the Bitvavo slice.
- Advanced feature experimentation platform.
- Real-time streaming ingestion.
- Backtest ranking or candidate selection logic.
- Paper/live trade execution behavior.

## Hard constraints (non-negotiable)
- The supported timeframe set for this epic must be explicitly enumerated in configuration/docs; wildcard “all timeframes” support is out of scope.
- Candle identity must be deterministic and unique per `(exchange, market, timeframe, open_time_utc)`.
- Historical retrieval must respect the upstream Bitvavo candles limit per request and split large ranges into deterministic batches.
- Pipeline audit metadata must use dedicated pipeline run/stage records; backtest persistence tables are not valid substitutes.
- Every pipeline run must persist run metadata including: run identifier, stage name, stage status, input reference(s), and feature-set version (when applicable).
- Gap handling must be explicit per run segment: either `blocked`, `accepted_with_gap_markers`, or `not_applicable`; silent continuation is invalid.
- Feature outputs must carry feature-set identity (name + version) so recomputation provenance is unambiguous.

## Success criteria
- Re-running ingestion on the same source interval does not create duplicate candle identities.
- Re-running feature computation on unchanged normalized candles and unchanged feature-set version yields identical feature snapshots.
- Deterministic fixtures replay representative ingestion/feature edge cases with stable outputs across at least two consecutive reruns.
- Pipeline stages are explicit, named, and auditable through logs and persisted run metadata.
- Missing candle intervals are surfaced with explicit handling outcome (`blocked` or `accepted_with_gap_markers`).
- Raw and derived data ownership is clear and reproducible from persisted records.

## Failure criteria
- Same input interval and config can produce different persisted candles or feature values without explicit version/config change.
- Pipeline retries produce duplicate or conflicting candle identities.
- Time normalization behavior is implicit or inconsistent between components.
- Missing candle behavior is hidden, ad-hoc, or undefined in persisted run outcomes.
- Team cannot explain which dataset is authoritative for a specific output.

## Architectural impact
- Extends worker pipeline from placeholder stages to deterministic ingestion/feature stages.
- Uses persistence foundation from Epic 0002 for raw and derived records with idempotency guarantees.
- Introduces fixture-driven determinism tests as a required quality gate.
- Adds dedicated pipeline run/stage audit records for ingestion and feature execution metadata.
- Adds explicit run metadata needed by Epic 0004 explainability and Epic 0005 audit trail.

## Risks
- Subtle timestamp boundary mistakes can break determinism.
- Historical batch boundary mistakes can introduce silent gaps or duplicates.
- Exchange payload quirks may introduce non-obvious normalization edge cases.
- Premature generalization to many exchanges could delay value delivery.
- Incomplete gap policy may hide data quality issues.

## Open questions
- Should blocked segments fail the entire run or mark partial-run status with explicit non-usable outputs?
- What is the minimum acceptable fixture matrix by timeframe before this epic can be marked done?
- How should late-arriving historical corrections be represented without breaking auditability?

## Implementation order
1. Lock deterministic ingestion contract (identity, ordering, boundary semantics, supported timeframe list).
2. Implement Bitvavo historical ingestion with bounded batch retrieval, normalization, and idempotent persistence.
3. Implement gap detection + explicit run outcome semantics.
4. Implement deterministic feature computation with feature-set identity.
5. Add replay fixtures and deterministic regression checks as release gate.
6. Harden stage/run metadata for auditability and downstream consumption.

## Initial feature decomposition
1. **Feature A: Deterministic Candle Import Core**  
   Bitvavo historical pull, normalized candle mapping, deterministic identity, idempotent persistence.
   Includes bounded batched retrieval for large source ranges.
2. **Feature B: Data Quality and Gap Semantics**  
   Gap detection, expected-interval checks, explicit missing-data handling outcomes.
3. **Feature C: Deterministic Feature Snapshot Generation**  
   Versioned feature computation with stable outputs from stable normalized inputs.
4. **Feature D: Replayability and Audit Surface**  
   Fixtures, replay command flow, run metadata, and stage-level observability.
