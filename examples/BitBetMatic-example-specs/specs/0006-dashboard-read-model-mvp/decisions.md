# Decisions - Epic 0006

- Decision: Build a dedicated dashboard epic instead of stretching Epics 0003 and 0004.
  - Reason: The work is primarily read-model and UI composition, not ingestion or ranking logic.

- Decision: Keep the dashboard read-only for the MVP.
  - Reason: The current gap is visibility, not workflow control.

- Decision: Represent "Strategies" as evaluated candidates from backtest runs.
  - Reason: The system does not yet persist a broader strategy catalog or ranking result set.

- Decision: Defer ranking, winner claims, and explainability panels.
  - Reason: Epic 0004 has not yet implemented the persisted artifacts needed to support those views honestly.

- Decision: Prefer graceful degradation over strict JSON projection failures.
  - Reason: A malformed metrics/config blob should weaken a card or row, not take down the dashboard.
