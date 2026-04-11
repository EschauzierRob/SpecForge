# Plan

1. Add a buy-and-hold control evaluator to the deterministic candidate catalog.
2. Extend replay metrics with condition observation share so activation gates can be sample-aware.
3. Implement `SelectConditionActivations` with:
   - condition-local positive-net gates,
   - whole-run safety rails,
   - explicit `stay_flat` outcomes.
4. Extend read models and dashboard pages with:
   - activation status by condition,
   - control-vs-candidate deltas,
   - control-candidate visibility in traces and tables.
5. Add regression coverage for:
   - control inclusion,
   - activation eligibility/stay-flat behavior,
   - worker orchestration,
   - dashboard projections.
