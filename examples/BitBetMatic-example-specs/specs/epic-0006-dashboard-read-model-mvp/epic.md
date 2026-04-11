# Dashboard Read Model MVP

## ID
E-0006

## Type
Epic

## Parent
None

## Summary
Epic 0006 turns the dashboard from a static placeholder into a read-only operator and developer surface over persisted ingestion, feature, and backtest data.

## Problem / Context
Epic 0006 turns the dashboard from a static placeholder into a read-only operator and developer surface over persisted ingestion, feature, and backtest data.

## Goals
- Deliver a read-only dashboard MVP with real API-backed pages for:
- market data coverage and candle visualization
- evaluated candidate visibility
- backtest run visibility

## Non-goals
- Write actions such as reruns or backtest triggers.
- Multi-exchange expansion.
- Ranking, winner selection, or explainability panels.
- Paper-trading analytics beyond a clear placeholder.
- Separate observability product area beyond what the overview page already surfaces.

## Requirements
- Minimal read endpoints shaped for dashboard usage.
- Overview page with pipeline freshness, stage status, gap outcome, candle coverage, and charting.
- Strategies page framed as evaluated candidate variants from persisted backtest runs.
- Backtests page with run summaries, candidate metrics, replay window, and cost assumptions.
- Empty and warning states for sparse, blocked, or failed data conditions.
- The dashboard must remain read-only.
- UTC timestamps must remain explicit and consistent across API and UI.
- Strategies must be represented as evaluated candidates, not as a separate strategy catalog.
- Failed or blocked pipeline/backtest states must be visible and must not be presented as healthy insights.
- The dashboard must tolerate missing or malformed optional JSON payloads without failing the whole page.

## Acceptance Criteria
- Operators can inspect persisted candle history visually for a selected market and timeframe.
- Operators can see whether ingestion, features, and backtests are fresh, succeeded, blocked, or failed.
- Operators can inspect evaluated candidate metrics without needing ranking artifacts.
- Operators can inspect backtest context including replay window, feature set version, and fee/slippage assumptions.

## Dependencies
- E-0005

## Open Questions
- None

## Notes
- Migrated from legacy-specs/0006-dashboard-read-model-mvp/spec.md.
- Archived decisions.md under legacy-specs/0006-dashboard-read-model-mvp.
- Archived clarifications.md under legacy-specs/0006-dashboard-read-model-mvp.
- Archived plan.md under legacy-specs/0006-dashboard-read-model-mvp.
