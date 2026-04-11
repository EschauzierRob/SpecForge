# 0006 - Dashboard Read Model MVP

## Overview
Epic 0006 turns the dashboard from a static placeholder into a read-only operator and developer surface over persisted ingestion, feature, and backtest data.

This epic is intentionally narrow. It should show trusted persisted truth, not invent broader product concepts that the underlying data model does not support yet.

## Objective
Deliver a read-only dashboard MVP with real API-backed pages for:
- market data coverage and candle visualization
- evaluated candidate visibility
- backtest run visibility

## Scope
### In scope
- Minimal read endpoints shaped for dashboard usage.
- Overview page with pipeline freshness, stage status, gap outcome, candle coverage, and charting.
- Strategies page framed as evaluated candidate variants from persisted backtest runs.
- Backtests page with run summaries, candidate metrics, replay window, and cost assumptions.
- Empty and warning states for sparse, blocked, or failed data conditions.

### Out of scope
- Write actions such as reruns or backtest triggers.
- Multi-exchange expansion.
- Ranking, winner selection, or explainability panels.
- Paper-trading analytics beyond a clear placeholder.
- Separate observability product area beyond what the overview page already surfaces.

## Hard constraints
- The dashboard must remain read-only.
- UTC timestamps must remain explicit and consistent across API and UI.
- Strategies must be represented as evaluated candidates, not as a separate strategy catalog.
- Failed or blocked pipeline/backtest states must be visible and must not be presented as healthy insights.
- The dashboard must tolerate missing or malformed optional JSON payloads without failing the whole page.

## Success criteria
- Operators can inspect persisted candle history visually for a selected market and timeframe.
- Operators can see whether ingestion, features, and backtests are fresh, succeeded, blocked, or failed.
- Operators can inspect evaluated candidate metrics without needing ranking artifacts.
- Operators can inspect backtest context including replay window, feature set version, and fee/slippage assumptions.

## Failure criteria
- The dashboard continues to be mostly placeholder content after the slice.
- UI claims exceed what is actually persisted, such as best-strategy or winner assertions.
- Sparse or blocked data is hidden or visually indistinguishable from healthy data.
- A malformed metrics or configuration JSON blob causes a 500 response for list/detail views.

## Architectural impact
- Adds a small dashboard read-model layer in infrastructure.
- Extends the API with query-focused endpoints under `/api`.
- Replaces placeholder dashboard routes with real React pages backed by the read APIs.

## Implementation order
1. Add the dashboard read-model spec and task list.
2. Add read-model query services and typed response DTOs.
3. Add minimal API endpoints for overview, candles, candidates, and backtests.
4. Replace placeholder dashboard routes with Overview, Strategies, and Backtests pages.
5. Add focused backend read-model tests and verify API/dashboard builds.
