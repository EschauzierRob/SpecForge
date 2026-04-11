# Plan - Epic 0006

1. Add a read-model layer that projects pipeline runs, candle coverage, candidate metrics, and backtest context into dashboard-safe DTOs.
2. Expose the read models through narrow `/api` endpoints with UTC-safe filters and graceful empty-state behavior.
3. Replace the placeholder dashboard with Overview, Strategies, and Backtests pages backed by the new endpoints.
4. Add a practical candle chart with close-line and candlestick modes using the same candle payload.
5. Verify the slice with query-service tests plus API and dashboard build validation.
