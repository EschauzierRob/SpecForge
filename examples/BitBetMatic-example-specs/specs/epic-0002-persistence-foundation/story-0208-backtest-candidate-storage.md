# Backtest & Candidate Storage

## ID
S-0208

## Type
Story

## Parent
F-0203

## Summary
As a system, I want to persist backtest runs and strategy candidates so that evaluation results are reproducible, comparable, and explainable.

## Problem / Context
Migrated from BitBetMatic Epic 0002.

## Goals
- As a system, I want to persist backtest runs and strategy candidates so that evaluation results are reproducible, comparable, and explainable.

## Non-goals
- None

## Requirements
- As a system, I want to persist backtest runs and strategy candidates so that evaluation results are reproducible, comparable, and explainable.
- Acceptance Criteria
- BacktestRun:
- stores metadata about a run (time window, configuration, context)
- includes start/end timestamps
- has a clear lifecycle state (e.g. created, running, completed)
- StrategyCandidate:
- belongs to a BacktestRun

## Acceptance Criteria
- BacktestRun:
- stores metadata about a run (time window, configuration, context)
- includes start/end timestamps
- has a clear lifecycle state (e.g. created, running, completed)
- StrategyCandidate:
- belongs to a BacktestRun
- stores:
- parameter configuration (snapshot)
- computed metrics / scores
- Configuration and parameter data:

## Dependencies
- F-0203

## Open Questions
- None

## Notes
- Original story material archived under legacy-specs/0002-persistence-foundation.
