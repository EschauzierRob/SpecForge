# Plan — Epic 0003

Epic 0003 delivery is split into incremental slices.

## Current execution focus
- **Slice 1 trust-boundary completion**: deterministic batched Bitvavo candle retrieval plus explicit gap semantics and dedicated pipeline run/stage metadata.
- Keep ingestion behavior UTC-normalized, rerunnable, and idempotent while surfacing blocked vs accepted-with-gap-markers outcomes for downstream stages.
- **Slice 2** remains deterministic feature computation from persisted normalized candles, idempotent `FeatureSnapshotRecord` persistence, and basic feature-stage observability.
- Feature set remains intentionally small for auditability (`sma_close_5`, `sma_close_20`, `volatility_return_std_20`).

## Next slices (not in current implementation scope)
1. Missing-candle gap handling outcomes and policy hardening.
2. Stage orchestration/run metadata hardening for full replayability and auditability.
3. Feature-set expansion beyond the minimal deterministic baseline.
