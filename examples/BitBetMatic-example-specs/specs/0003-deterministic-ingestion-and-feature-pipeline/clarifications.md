# Clarifications — Epic 0003

## Resolved
- The first implementation slice is intentionally Bitvavo-only to keep scope narrow and delivery practical.
- Determinism and idempotency are mandatory release requirements, not quality improvements to defer.
- Raw candles are the source of truth for ingestion outputs; derived feature snapshots are source of truth for feature-stage outputs.
- Dedicated pipeline run/stage metadata is the source of truth for pipeline execution auditability.
- Gap handling must be explicit per run segment (`blocked` or `accepted_with_gap_markers`); silent continuation is not allowed.
- Sparse-but-structurally-valid Bitvavo history is accepted as `accepted_with_gap_markers`; structural validation failures are `blocked`.
- Feature snapshots must include feature-set identity (name + version) for deterministic recomputation.

## Open questions
- Should a `blocked` segment fail the entire run or produce a partial-run status with clearly non-usable outputs?
- What minimum fixture matrix by timeframe is required for deterministic confidence?
- How should late-arriving historical corrections be represented without breaking auditability?
