Epic 0002 — Persistence Foundation
1. Overview

This epic establishes the persistence foundation for BitBetMatic 2.0.

It defines:

the database platform (PostgreSQL)
the default persistence approach (EF Core with Npgsql)
schema evolution via migrations
initial core data structures
conventions for future data access
local development infrastructure

This epic intentionally does not implement product logic, but creates the foundation required for all subsequent epics (ingestion, features, backtesting, ranking, paper trading).

2. Objective

Create a persistence layer that is:

deterministic and reproducible
easy to evolve via migrations
optimized for C#-first development (minimal SQL exposure)
compatible with AI-assisted development
modular and extensible
explicit and explainable
3. Scope
In Scope
PostgreSQL as primary database engine
EF Core + Npgsql as default persistence layer
DbContext and entity configuration structure
Migration setup and workflow
Core persistence entities (minimal viable set)
Persistence-related configuration
Local Docker setup for Postgres and Redis
Persistence testing baseline
Documentation and usage conventions
Out of Scope
Market data ingestion logic
Feature computation logic
Backtesting implementation
Ranking algorithms
Paper trading execution
Performance optimization (beyond sane defaults)
Advanced SQL tuning or partitioning
Event sourcing or CQRS patterns
4. Success Criteria

This epic is complete when:

Postgres and Redis run locally via Docker
The application connects to Postgres via EF Core
Migrations can be created and applied from scratch
The schema is reproducible on a clean environment
Core persistence entities exist and are coherent
EF Core is the default persistence approach
SQL usage is explicitly constrained and documented
Basic persistence tests pass
Documentation clearly explains persistence usage
5. Failure Criteria

This epic must be revisited if:

persistence design becomes tightly coupled to future assumptions
generic repository abstractions are introduced unnecessarily
EF Core and SQL usage are mixed without clear boundaries
migrations become unreliable or inconsistent
local setup is fragile or difficult
persistence becomes a black box
agents or developers cannot clearly understand data flow
6. Architectural Principles
6.1 EF Core First
EF Core is the default persistence mechanism
DbContext may be used directly where appropriate
Migrations are the single source of truth for schema evolution
6.2 SQL as an Exception
Raw SQL or Dapper is allowed only for:
bulk operations
performance-critical queries
analytical queries
Must be:
isolated
explicit
documented
6.3 No Generic Repository Pattern
Avoid IGenericRepository<T>
Prefer:
direct DbContext usage
explicit query services
6.4 Layer Separation
Domain layer remains persistence-agnostic
Infrastructure layer owns EF configuration and database concerns
6.5 Minimal but Future-Aware Design
Design for candles, features, backtests, and selections
Avoid premature optimization
7. Core Data Model (Initial)

The following entities are introduced at a minimal level:

MarketCandleRecord
FeatureSnapshotRecord
BacktestRunRecord
StrategyCandidateRecord
SelectionDecisionRecord

These support the next epics without overcommitting to final structure.

8. Features Breakdown

Feature 1 — Local Infrastructure & Connectivity
Goal

Enable reliable local development using Postgres and Redis.

Story 1.1 — Dockerized Infrastructure

As a developer, I want Postgres and Redis to run locally via Docker, so I can develop without manual setup.

Acceptance Criteria
Docker Compose includes Postgres and Redis
Services start reliably
Credentials and ports are documented
Data persistence behavior is defined
Story 1.2 — Application Connectivity

As a developer, I want the application to connect via configuration, so environments remain consistent.

Acceptance Criteria
Connection strings are configurable
API and Worker connect successfully
Startup fails clearly on misconfiguration

Feature 2 — EF Core Foundation & Migrations
Goal

Establish EF Core as the primary persistence mechanism with controlled schema evolution.

Story 2.1 — DbContext Structure

As a developer, I want a clear DbContext and mapping structure, so persistence is maintainable.

Acceptance Criteria
Central AppDbContext exists
Entity configurations are organized
Naming conventions are consistent
Story 2.2 — Initial Migration Baseline

As a developer, I want migrations to define schema evolution, so database changes are reproducible.

Acceptance Criteria
Initial migration can be created
Database can be built from scratch
Migration process is documented
Story 2.3 — Schema Governance Rules

As a team/agent, I want clear rules for schema evolution, so consistency is maintained.

Acceptance Criteria
Migration policy documented
Naming conventions defined
Breaking change strategy defined

Feature 3 — Core Persistence Model (Reference-Informed)
Goal

Define minimal, extensible persistence models that support upcoming epics (ingestion, features, backtesting, selection), while being informed by the proven Bitvavo integration from BitBetMatic v1.

The data model must:

align with real-world exchange data structures (e.g. Bitvavo candles)
avoid unnecessary reinvention
remain clean, explicit, and compatible with the BitBetMatic 2.0 architecture
support deterministic processing and reproducibility
Reference Usage Requirement

All entity design in this feature must be informed by the legacy reference material:

docs/references/bitvavo-legacy/

Specifically:

capabilities.md
api-surface.md
code-snippets.md
migration-notes.md
snippets/*.cs
Rules
Use legacy material to understand real API shapes and behavior
Reuse validated concepts and field structures where appropriate
Do NOT copy legacy code directly into production entities
Adapt all reused concepts to:
EF Core persistence
clean domain boundaries
deterministic processing requirements
Design principle

Prefer “adapted alignment with proven API behavior” over “clean but unrealistic abstraction”.

Stories
Story 3.1 — Candle Storage (Bitvavo-Aligned)

As a system, I want to store market candles reliably and consistently with exchange data structures, so ingestion is deterministic and API-aligned.

Acceptance Criteria
Candle model includes:
instrument / market (e.g. BTC-EUR)
timeframe (e.g. 1m, 5m, 1h)
open time (UTC)
open, high, low, close
volume
Field semantics align with Bitvavo API responses where applicable
Unique constraint ensures no duplicate candles per:
exchange + instrument + timeframe + timestamp
Time is stored explicitly as UTC
Model supports idempotent ingestion
No implicit assumptions about candle completeness (partial data handled explicitly)
Reference Guidance
Align field meanings with v1 candle parsing logic
Validate timestamp interpretation against legacy implementation
Reuse naming conventions only if they remain clear and consistent
Story 3.2 — Feature Snapshot Storage

As a system, I want to store computed feature snapshots in a way that is reproducible, evolvable, and traceable back to source data.

Acceptance Criteria
Feature snapshot:
links to a specific market context (instrument + timeframe + timestamp)
references or derives from stored candle data
Model supports:
evolving feature sets over time
versioning or implicit schema evolution
Clear distinction between:
raw inputs (candles)
derived features
Storage approach may combine:
relational fields for commonly queried values
JSONB (or equivalent) for flexible feature payloads
Reference Guidance
Use v1 feature-related logic (if present) as inspiration only
Do not replicate any tightly coupled or ad-hoc feature storage patterns from v1
Prefer explicitness and traceability over compactness
Story 3.3 — Backtest & Candidate Storage

As a system, I want to persist backtest runs and strategy candidates so that evaluation results are reproducible, comparable, and explainable.

Acceptance Criteria
BacktestRun:
stores metadata about a run (time window, configuration, context)
includes start/end timestamps
has a clear lifecycle state (e.g. created, running, completed)
StrategyCandidate:
belongs to a BacktestRun
stores:
parameter configuration (snapshot)
computed metrics / scores
Configuration and parameter data:
must be stored as explicit snapshots (e.g. JSONB)
must not rely on implicit defaults
Model supports:
comparing candidates within a run
reconstructing the evaluation context later
Reference Guidance
v1 likely does not have a clean backtest model → do not attempt to mirror it
However:
reuse any proven parameter structures or naming patterns where meaningful
Prioritize:
clarity
traceability
reproducibility
Story 3.4 — Selection Decision Storage

As a system, I want to persist selection decisions so that chosen strategies are explainable and auditable.

Acceptance Criteria
SelectionDecision:
references:
BacktestRun
selected StrategyCandidate
Stores:
rationale summary (human-readable)
optional structured reasoning data
timestamp of decision
Model supports:
reconstructing why a candidate was chosen
auditing historical decisions
Reference Guidance
v1 likely lacks structured explainability → treat this as a new capability
However:
reuse any observable “decision logic patterns” from v1 as inspiration
Do not introduce overly complex explainability structures at this stage
Cross-Cutting Requirements
Determinism
Data structures must support deterministic processing:
same input → same stored result
Avoid implicit transformations during persistence
UTC Time Handling
All timestamps must be stored as UTC
No local time assumptions allowed
Idempotency
Models must support safe re-processing:
candle imports must not duplicate
feature snapshots must not silently overwrite incompatible data
Minimal but Extensible
Keep schemas simple
Avoid premature normalization or abstraction
Allow future evolution without breaking existing data
EF Core Compatibility
All entities must be:
explicitly mapped
migration-friendly
queryable via EF Core without hacks
Explicit Trade-offs

Where design decisions are made (e.g. JSONB vs relational fields), they must be:

documented
intentional
reversible if needed
Non-Goals

This feature must NOT:

implement ingestion logic
implement feature computation
implement trading logic
introduce exchange clients
introduce generic repository abstractions
attempt full domain modeling for all future use cases
Risks
Overfitting to legacy Bitvavo implementation
Over-generalizing beyond actual use cases
Premature schema optimization
Mixing API DTO thinking with persistence model design
Open Questions
Should feature snapshots use:
structured columns
JSONB
or a hybrid approach?
Should strategy parameters be:
strongly typed
or stored as snapshots initially?
Should exchange be part of candle uniqueness key from day one?
How much explainability structure is needed for MVP vs later?
Implementation Guidance
Start with Candle model first (lowest risk, highest reuse from v1)
Then introduce Backtest + Candidate models
Then FeatureSnapshot
Then SelectionDecision
Add migrations incrementally, not in one large batch
Validate schema with simple insert/read tests before proceeding

Feature 4 — Persistence Access Conventions
Goal

Prevent inconsistent data access patterns.

Story 4.1 — Default Usage Guidelines

As a developer, I want clear persistence rules, so code remains consistent.

Acceptance Criteria
DbContext usage guidelines exist
Anti-patterns are documented
Reference implementation notes: see `specs/0002-persistence-foundation/feature-4-access-conventions.md` and `docs/persistence-access-conventions.md`.
Story 4.2 — SQL Exception Path

As a developer, I want a controlled SQL escape hatch, so performance tuning is possible.

Acceptance Criteria
SQL usage policy exists
Query service pattern is defined
Reference implementation notes: see `specs/0002-persistence-foundation/feature-4-access-conventions.md` and `docs/persistence-access-conventions.md`.

Feature 5 — Testing Baseline
Goal

Ensure persistence works reliably.

Story 5.1 — Persistence Smoke Tests
DbContext initializes
Migrations apply
Basic read/write works
Story 5.2 — Architecture Tests
Domain has no infrastructure dependencies
Layer boundaries enforced

Feature 6 — Documentation
Goal

Ensure clarity for humans and agents.

Story 6.1 — Persistence Documentation
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
13. Implementation Order
Feature 1 — Infrastructure
Feature 2 — EF Core + migrations
Feature 3 — Core entities
Feature 4 — Conventions
Feature 5 — Tests
Feature 6 — Documentation