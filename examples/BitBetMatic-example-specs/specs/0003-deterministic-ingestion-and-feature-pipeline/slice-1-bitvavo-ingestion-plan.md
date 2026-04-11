# Epic 0003 — Slice 1 Implementation Plan (Bitvavo Deterministic Ingestion)

## Scope (this slice only)
- Deterministic **historical candle ingestion** from Bitvavo for a fixed timeframe allowlist (configured explicitly, no wildcard support).
- Deterministic **normalization** from Bitvavo payload into the internal candle model (UTC and bucket-aligned open times).
- Candle-level and batch-level **validation** prior to persistence.
- **Idempotent persistence** into `MarketCandleRecord` keyed by deterministic candle identity.
- Basic **observability** for run/stage visibility and operational debugging.

## Non-goals
- Feature computation (indicators, rolling windows, feature snapshots).
- Trading logic (signal generation, ranking, order placement).
- Multi-exchange abstraction layers beyond what the Bitvavo adapter minimally requires.
- Scheduling/orchestration expansion (cron-like automation, distributed coordinators, retry frameworks).
- Real-time streaming ingestion.

## Acceptance criteria
1. Re-running the same Bitvavo interval + timeframe config produces no duplicate `MarketCandleRecord` identities.
2. Bitvavo candles normalize deterministically into one canonical internal shape:
   - `open_time_utc` aligned to timeframe boundaries.
   - UTC-only time semantics.
   - Stable numeric parsing/rounding policy documented and tested.
3. Invalid candles are rejected with explicit reason codes (for example: timestamp misalignment, non-positive volume, malformed OHLC ordering if enforced).
4. Persistence is idempotent using deterministic key: `(exchange, market, timeframe, open_time_utc)`.
5. Ingestion emits minimal but sufficient telemetry:
   - run identifier,
   - stage name/status,
   - requested range,
   - fetched/accepted/rejected/upserted counts,
   - elapsed duration,
   - error summary when failed.
6. At least one deterministic replay test demonstrates same-input/same-config => same persisted dataset across two consecutive runs.

## Refined implementation plan
1. **Contract lock-in**
   - Freeze timeframe allowlist for this slice.
   - Freeze candle identity and normalization rules in code + docs.
2. **Bitvavo historical reader**
   - Implement a narrowly scoped client path for historical candle retrieval only.
   - Enforce deterministic ordering before normalization.
3. **Normalization pipeline**
   - Map exchange payload fields into internal candle model.
   - Apply UTC conversion and timeframe bucket alignment.
4. **Validation gate**
   - Run deterministic validations before persistence.
   - Produce structured validation failures with machine-readable reason codes.
5. **Idempotent persistence path**
   - Upsert `MarketCandleRecord` by deterministic identity.
   - Guarantee rerun convergence (no net-new duplicates).
6. **Basic observability**
   - Add structured logs + stage/run metrics counters.
   - Persist minimal run metadata needed for diagnosis.
7. **Determinism verification**
   - Add replay fixture and integration-style test for duplicate/rerun behavior.

## Technical approach
- **Deterministic input envelope**
  - Inputs: `exchange=bitvavo`, `market`, `timeframe`, `from_utc`, `to_utc`.
  - Normalize request bounds to deterministic inclusive/exclusive semantics and document them.
- **Internal normalization model**
  - Transform external payload into canonical candle DTO/entity first, then validate, then persist.
  - Normalize decimal precision and parsing culture-invariantly to avoid locale drift.
- **Validation strategy**
  - Fast fail for structural errors (missing fields, parse failures).
  - Domain validation for time alignment and value invariants.
  - Batch summary returned for observability and tests.
- **Persistence strategy**
  - Use repository/data access path from Epic 0002.
  - Implement idempotent upsert semantics at DB boundary (unique key/constraint aligned with candle identity).
- **Observability strategy (minimal)**
  - Structured logs at stage start/end and failure.
  - Counters for fetched/normalized/invalid/upserted records.
  - Correlate all logs with run id.

## Risks and mitigations
- **Boundary-time bugs** (off-by-one bucket errors).  
  *Mitigation*: explicit request-bound semantics + targeted boundary fixtures.
- **Exchange payload quirks** (ordering, sparse intervals).  
  *Mitigation*: deterministic re-sort + validation + clear rejected-record accounting.
- **False idempotency confidence** (app-level dedupe without DB enforcement).  
  *Mitigation*: enforce identity with persistent unique constraint and upsert path.
- **Telemetry noise or blind spots**.  
  *Mitigation*: start with fixed minimal fields; avoid unbounded high-cardinality labels.

## Task breakdown (execution-ready)
1. Document and freeze slice-1 contract (timeframes, identity key, bound semantics).
2. Implement Bitvavo historical fetch adapter for scoped timeframes.
3. Implement normalization mapper into internal candle model.
4. Implement validation rules + reason codes.
5. Implement idempotent `MarketCandleRecord` upsert path.
6. Add structured logs/metrics + run id propagation.
7. Add deterministic replay test (two-run convergence) and one invalid-record test.
8. Update Epic 0003 `tasks.md` checkboxes for completed slice-1 items only.
