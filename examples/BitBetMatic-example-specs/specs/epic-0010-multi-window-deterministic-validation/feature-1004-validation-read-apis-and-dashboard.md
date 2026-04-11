# Validation Read APIs and Dashboard

## ID
F-1004

## Type
Feature

## Parent
E-0010

## Summary
The goal is to stop treating one continuous backtest window as the main truth set. Instead, the system should persist cross-window evidence that shows which candidates are repeatably acceptable, how often they beat the buy-and-hold control, and whether any non-control candidate is validated strongly enough to matter.

## Problem / Context
Migrated from BitBetMatic Epic 0010.

## Goals
- The goal is to stop treating one continuous backtest window as the main truth set. Instead, the system should persist cross-window evidence that shows which candidates are repeatably acceptable, how often they beat the buy-and-hold control, and whether any non-control candidate is validated strongly enough to matter.

## Non-goals
- None

## Requirements
- Epic 0010 adds a validation layer over the existing deterministic pipeline by replaying the same candidate set across multiple fixed historical windows.
- The goal is to stop treating one continuous backtest window as the main truth set. Instead, the system should persist cross-window evidence that shows which candidates are repeatably acceptable, how often they beat the buy-and-hold control, and whether any non-control candidate is validated strongly enough to matter.
- Deliver a deterministic validation slice that:
- reuses the current ingestion, feature, backtest, ranking, condition-selection, and activation flow per named window,
- persists suite-level validation records across five fixed BTC-EUR / 15m windows,
- ranks candidates by repeatability rather than a single-run outcome,
- keeps the control candidate visible as the benchmark but never promotes it as the recommended strategy,
- surfaces suite summaries, per-window outcomes, and candidate repeatability in the API and dashboard.

## Acceptance Criteria
- The system can persist a validation suite with linked pipeline and backtest runs for each configured window.
- Suite candidate summaries are stable across reruns with the same candles and configuration.
- The suite leaderboard shows repeatability evidence such as positive-net frequency, beat-control frequency, and activation-qualified frequency.
- The dashboard exposes enough cross-window evidence to tell whether a candidate is only surviving one period or repeating across multiple windows.

## Dependencies
- E-0010

## Open Questions
- None

## Notes
- Original feature material archived under legacy-specs/0010-multi-window-deterministic-validation.
