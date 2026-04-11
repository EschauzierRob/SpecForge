# Strategies and Backtests UI

## ID
F-0603

## Type
Feature

## Parent
E-0006

## Summary
This epic is intentionally narrow. It should show trusted persisted truth, not invent broader product concepts that the underlying data model does not support yet.

## Problem / Context
Migrated from BitBetMatic Epic 0006.

## Goals
- This epic is intentionally narrow. It should show trusted persisted truth, not invent broader product concepts that the underlying data model does not support yet.

## Non-goals
- None

## Requirements
- Epic 0006 turns the dashboard from a static placeholder into a read-only operator and developer surface over persisted ingestion, feature, and backtest data.
- This epic is intentionally narrow. It should show trusted persisted truth, not invent broader product concepts that the underlying data model does not support yet.
- Deliver a read-only dashboard MVP with real API-backed pages for:
- market data coverage and candle visualization
- evaluated candidate visibility
- backtest run visibility
- Minimal read endpoints shaped for dashboard usage.
- Overview page with pipeline freshness, stage status, gap outcome, candle coverage, and charting.

## Acceptance Criteria
- Operators can inspect persisted candle history visually for a selected market and timeframe.
- Operators can see whether ingestion, features, and backtests are fresh, succeeded, blocked, or failed.
- Operators can inspect evaluated candidate metrics without needing ranking artifacts.
- Operators can inspect backtest context including replay window, feature set version, and fee/slippage assumptions.

## Dependencies
- E-0006

## Open Questions
- None

## Notes
- Original feature material archived under legacy-specs/0006-dashboard-read-model-mvp.
