s # Tasks — Epic 0005

- [ ] Define event taxonomy for signal, decision, order, fill/reject, and position update.
- [ ] Define required correlation identifiers across one signal lifecycle.
- [ ] Define explicit transition map and invalid-transition rejection behavior.
- [ ] Implement minimal deterministic paper order simulation policy for MVP (no exchange realism).
- [ ] Persist correlated audit events for each lifecycle step.
- [ ] Persist position state snapshots tied to correlated event trail.
- [ ] Add guardrails with machine-usable rejection code + readable reason text.
- [ ] Expose API/dashboard read model for recent execution trail and active position state.
- [ ] Add deterministic runtime tests for transition validity, rejection paths, and trail completeness.
