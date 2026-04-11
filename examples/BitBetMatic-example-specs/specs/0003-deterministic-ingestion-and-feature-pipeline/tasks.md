# Tasks — Epic 0003

## Slice 1 — Deterministic Bitvavo ingestion (current)
- [x] Lock supported timeframe list for slice scope and document explicit exclusions.
- [x] Define ingestion stage contract, deterministic input envelope, and candle identity key.
- [x] Add deterministic batched Bitvavo historical candle retrieval for large source ranges using bounded requests.
- [x] Add configurable per-request candle limit for Bitvavo historical ingestion, capped by upstream API constraints.
- [x] Add Bitvavo historical candle adapter for the scoped timeframe list only.
- [x] Implement UTC normalization + timeframe bucket alignment + boundary handling rules.
- [x] Add ingestion validation (structural + domain) with explicit rejection reason codes.
- [x] Enforce idempotent candle persistence semantics in `MarketCandleRecord` keyed by deterministic candle identity.
- [x] Add batch-level ingestion observability (batch index, requested window, fetched/inserted/skipped counts, empty or unexpectedly small responses).
- [x] Add basic stage/run observability (run id, status, counts, duration, failure summary).
- [x] Add replay fixture tests for rerun/idempotency and invalid-record behavior.
- [x] Add replay tests for multi-batch ingestion and overlap-safe reruns.

## Later slices — Out of current implementation focus
- [x] Add missing-candle detection with explicit run outcomes (`blocked` or `accepted_with_gap_markers`).
- [x] Define feature-set identity (name/version/computation key) for deterministic recomputation.
- [x] Implement first feature snapshot computation slice from normalized candles only.
- [x] Persist expanded stage/run metadata required for downstream explainability and audit trail.
- [x] Document raw vs derived data ownership and stage source-of-truth expectations.
