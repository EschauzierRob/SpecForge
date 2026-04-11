# Plan — Epic 0005

1. Define canonical execution events, required correlation identifiers, and one-signal lifecycle model.
2. Define and document allowed paper-runtime state transitions and invalid-transition handling.
3. Implement minimal deterministic decision and simulated order outcome flow with guardrail checks.
4. Persist audit events and position snapshots for every valid transition.
5. Expose operator-facing runtime visibility for trail review and current position state.
6. Add deterministic tests for transition validity, rejection paths, and trail completeness.
