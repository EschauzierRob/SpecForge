# 0010 - Multi-Window Deterministic Validation

## Overview
Epic 0010 adds a validation layer over the existing deterministic pipeline by replaying the same candidate set across multiple fixed historical windows.

The goal is to stop treating one continuous backtest window as the main truth set. Instead, the system should persist cross-window evidence that shows which candidates are repeatably acceptable, how often they beat the buy-and-hold control, and whether any non-control candidate is validated strongly enough to matter.

## Objective
Deliver a deterministic validation slice that:
- reuses the current ingestion, feature, backtest, ranking, condition-selection, and activation flow per named window,
- persists suite-level validation records across five fixed BTC-EUR / 15m windows,
- ranks candidates by repeatability rather than a single-run outcome,
- keeps the control candidate visible as the benchmark but never promotes it as the recommended strategy,
- surfaces suite summaries, per-window outcomes, and candidate repeatability in the API and dashboard.

## Scope
### In scope
- Dedicated validation configuration for fixed named windows.
- A separate validation worker and orchestration service that run suites sequentially.
- Dedicated persistence for validation suite runs, suite windows, and suite candidate summaries.
- Coverage-based exclusion of low-data windows from suite ranking.
- Suite-level repeatability scoring and decision artifacts.
- Validation read APIs and a dashboard page for cross-window evidence.

### Out of scope
- Multi-market validation.
- Multi-timeframe validation.
- Live activation or paper-trading changes.
- Replacing the existing per-window backtest flow.

## Hard constraints
- The slice remains deterministic and uses fixed named windows only.
- The first validation scope is BTC-EUR on 15m only.
- Existing ranking and activation logic remain window-local; the validation suite consumes their outputs rather than redefining them.
- Windows below coverage threshold are persisted as `insufficient_data`, not counted as successful evidence.
- The control candidate is included in every window and suite summary, but it cannot become the suite’s recommended strategy.

## Success criteria
- The system can persist a validation suite with linked pipeline and backtest runs for each configured window.
- Suite candidate summaries are stable across reruns with the same candles and configuration.
- The suite leaderboard shows repeatability evidence such as positive-net frequency, beat-control frequency, and activation-qualified frequency.
- The dashboard exposes enough cross-window evidence to tell whether a candidate is only surviving one period or repeating across multiple windows.
