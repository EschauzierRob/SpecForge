# Clarifications

## Resolved
- Foundation epic should prioritize explicit contracts over advanced implementation.
- Persistence default is EF Core + Npgsql; Dapper/raw SQL is constrained.
- MVP excludes live trading implementation.

## Open questions
- Initial candle universes/timeframes for ingestion.
- First strategy family to implement after foundation.
- Explainability artifact format (JSON schema vs relational model).
- Minimum observability stack for MVP (OpenTelemetry, logs, metrics baseline).
