# Tasks - Epic 0006

- [x] Define a dashboard read-only MVP focused on overview, evaluated candidates, and backtests.
- [x] Add read-model DTOs for pipeline freshness, candle coverage, candidate metrics, and backtest run detail.
- [x] Implement query services that safely project persisted JSON config/metrics into dashboard responses.
- [x] Add `/api/dashboard/overview`, `/api/market-data/candles`, `/api/strategies/candidates`, `/api/backtests/runs`, and `/api/backtests/runs/{runKey}`.
- [x] Replace the placeholder dashboard overview route with pipeline status, candle coverage, and charting.
- [x] Replace the placeholder strategies route with evaluated candidate tables and summary insights.
- [x] Replace the placeholder backtests route with recent run summaries and selected-run candidate details.
- [x] Add a candidate-in-run trade trace view with buy/sell markers, hover details, and completed trade summaries.
- [x] Keep paper trading as an explicit not-yet-available placeholder.
- [x] Add backend tests for ordered candles, overview projection, candidate projection, and malformed JSON tolerance.
- [ ] Add dedicated frontend component tests once a frontend test harness is introduced.
