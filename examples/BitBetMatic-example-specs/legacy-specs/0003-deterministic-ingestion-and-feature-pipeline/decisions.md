# Decisions — Epic 0003

## D-0003-1
Determinism is a release gate for ingestion and feature stages: same normalized input + same config must yield same persisted outputs.

## D-0003-2
Bitvavo historical ingestion is the only required exchange integration for this epic's first implementation slice.

## D-0003-3
Time semantics are normalized to UTC with explicit timeframe boundary rules; implicit local-time interpretation is prohibited.

## D-0003-4
Idempotent import behavior is mandatory; retries/reruns must converge to one coherent dataset.

## D-0003-5
Raw candle records are authoritative for ingestion outputs; feature snapshots are authoritative for derived feature outputs.
