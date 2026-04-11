# Feature 3 Design Notes (Core Persistence Model)

## Legacy-aligned candle semantics

The candle record aligns with the Bitvavo v1 row layout described in `api-surface.md` and `snippets/candle-fetch-example.cs`, where candle rows are interpreted as:

- `[0]` open timestamp (Unix ms)
- `[1]` open
- `[2]` high
- `[3]` low
- `[4]` close
- `[5]` volume

For Feature 3 persistence, this is represented as explicit relational fields in `MarketCandleRecord`:

- `OpenTimeUtc` (`timestamp with time zone`)
- `Open`, `High`, `Low`, `Close`, `Volume` (`numeric(28,10)`)
- `Exchange`, `Instrument`, `Timeframe`

This keeps the persisted model deterministic and queryable while remaining compatible with proven upstream data semantics.

## Determinism, idempotency, and reproducibility

- Candle idempotency is enforced via a unique key on `(Exchange, Instrument, Timeframe, OpenTimeUtc)`, with check constraints to keep volume non-negative and OHLC bounds coherent.
- Feature snapshots are immutable snapshots keyed by `(SourceCandleId, FeatureSetName, FeatureSetVersion, ComputationKey)`.
- Backtest runs and candidates persist explicit configuration snapshots so results can be reconstructed later without relying on hidden defaults.
- Selection decisions persist both a required human-readable rationale and optional structured reasoning payload, and allow multiple timestamped decisions per run for audit history.

## JSON vs relational trade-offs

### Relational fields used when queryability matters

Used for:

- Market context and candle values.
- Core backtest metadata (status, window, context).
- Candidate identity and scoring.
- Selection timestamps and links.

Rationale:

- Strong filtering/grouping/sorting support.
- Clear schema-level constraints and foreign keys.
- Better long-term migration control for stable, high-value query axes.

### JSONB used for snapshot-style flexibility

Used for:

- `FeatureSnapshotRecord.FeatureValuesJson`
- `BacktestRunRecord.ConfigurationJson`
- `StrategyCandidateRecord.ParameterSnapshotJson`
- `StrategyCandidateRecord.MetricsJson`
- `SelectionDecisionRecord.ReasoningJson` (optional)

Rationale:

- Feature payloads and strategy parameters evolve frequently.
- Snapshot payloads must preserve exact historical input/output context.
- JSONB avoids premature schema churn while preserving explicit snapshot boundaries.

## Scope boundaries respected

This feature only introduces persistence entities, mappings, migrations, tests, and design notes.

It intentionally does **not** add:

- ingestion flows
- feature computation
- exchange clients
- repository abstractions
- additional services beyond persistence structure
