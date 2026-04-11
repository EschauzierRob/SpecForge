# Candle Storage (Bitvavo-Aligned)

## ID
S-0206

## Type
Story

## Parent
F-0203

## Summary
As a system, I want to store market candles reliably and consistently with exchange data structures, so ingestion is deterministic and API-aligned.

## Problem / Context
Migrated from BitBetMatic Epic 0002.

## Goals
- As a system, I want to store market candles reliably and consistently with exchange data structures, so ingestion is deterministic and API-aligned.

## Non-goals
- None

## Requirements
- As a system, I want to store market candles reliably and consistently with exchange data structures, so ingestion is deterministic and API-aligned.
- Acceptance Criteria
- Candle model includes:
- instrument / market (e.g. BTC-EUR)
- timeframe (e.g. 1m, 5m, 1h)
- open time (UTC)
- open, high, low, close
- volume

## Acceptance Criteria
- Candle model includes:
- instrument / market (e.g. BTC-EUR)
- timeframe (e.g. 1m, 5m, 1h)
- open time (UTC)
- open, high, low, close
- volume
- Field semantics align with Bitvavo API responses where applicable
- Unique constraint ensures no duplicate candles per:
- exchange + instrument + timeframe + timestamp
- Time is stored explicitly as UTC

## Dependencies
- F-0203

## Open Questions
- None

## Notes
- Original story material archived under legacy-specs/0002-persistence-foundation.
