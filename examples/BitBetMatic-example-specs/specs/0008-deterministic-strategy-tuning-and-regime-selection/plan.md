1. Define the bounded candidate grid and deterministic candidate-key format for SMA and TrendPullbackRegime families.
2. Add shared rule-based market-condition classification inside deterministic replay so aggregate metrics and trace views stay aligned.
3. Persist per-condition performance summaries alongside existing whole-run candidate metrics.
4. Add a dedicated `SelectPerConditionWinners` stage that persists condition winners and an overall fallback winner using existing selection artifacts.
5. Extend read models and dashboard views to surface condition winners, candidate condition metrics, and trace condition context.
6. Add deterministic regression tests for candidate generation, condition labeling, condition-local metrics, selection behavior, and dashboard projections.
