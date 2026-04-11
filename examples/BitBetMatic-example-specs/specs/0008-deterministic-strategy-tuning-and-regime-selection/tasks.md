# Tasks - Epic 0008

- [ ] Define the bounded deterministic candidate grid for SMA and TrendPullbackRegime families.
- [ ] Replace hard-coded hand-picked registrations with deterministic candidate-grid generation.
- [ ] Add rule-based market-condition classification using existing trend/regime features.
- [ ] Persist per-condition metrics in candidate metrics JSON beside whole-run metrics.
- [ ] Add the `SelectPerConditionWinners` stage with persisted per-condition winners and fallback winner artifacts.
- [ ] Extend backtest/strategy read models to expose condition winners and candidate condition metrics.
- [ ] Extend trace projection with hovered market-condition and rule-cluster context.
- [ ] Update dashboard pages with per-condition winner cards, candidate condition breakdowns, and condition filtering.
- [ ] Add deterministic tests for candidate-grid stability, condition classification, per-condition metrics, and selection outcomes.
