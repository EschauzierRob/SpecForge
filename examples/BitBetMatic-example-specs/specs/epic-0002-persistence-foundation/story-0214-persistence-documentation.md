# Persistence Documentation

## ID
S-0214

## Type
Story

## Parent
F-0206

## Summary
README updated
Architecture doc updated
Migration workflow documented
9. Open Questions
Feature storage format: relational vs JSONB hybrid
Strategy parameters: structured vs snapshot storage
Candle uniqueness: include exchange in key?
Enforce UTC-only timestamps? (recommended: yes)
Use Testcontainers or simpler test setup initially?
10. Risks
Over-modeling too early
ORM over-abstraction
Premature SQL optimization
Migration inconsistencies
Poor explainability later
11. Dependencies
Repository bootstrap complete
Docker setup available
EF Core + Npgsql working
12. Definition of Done
Local infra works
DbContext + mappings exist
Initial migration applied successfully
Core entities defined
Tests pass
Docs updated
No unnecessary abstractions introduced

## Problem / Context
Migrated from BitBetMatic Epic 0002.

## Goals
- README updated
Architecture doc updated
Migration workflow documented
9. Open Questions
Feature storage format: relational vs JSONB hybrid
Strategy parameters: structured vs snapshot storage
Candle uniqueness: include exchange in key?
Enforce UTC-only timestamps? (recommended: yes)
Use Testcontainers or simpler test setup initially?
10. Risks
Over-modeling too early
ORM over-abstraction
Premature SQL optimization
Migration inconsistencies
Poor explainability later
11. Dependencies
Repository bootstrap complete
Docker setup available
EF Core + Npgsql working
12. Definition of Done
Local infra works
DbContext + mappings exist
Initial migration applied successfully
Core entities defined
Tests pass
Docs updated
No unnecessary abstractions introduced

## Non-goals
- None

## Requirements
- README updated
- Architecture doc updated
- Migration workflow documented
- Open Questions
- Strategy parameters: structured vs snapshot storage
- Candle uniqueness: include exchange in key?
- Enforce UTC-only timestamps? (recommended: yes)
- Use Testcontainers or simpler test setup initially?

## Acceptance Criteria
- Persistence Documentation has verifiable canonical acceptance criteria.

## Dependencies
- F-0206

## Open Questions
- None

## Notes
- Original story material archived under legacy-specs/0002-persistence-foundation.
