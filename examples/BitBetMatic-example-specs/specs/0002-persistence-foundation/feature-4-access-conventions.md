# Feature 4 Design Notes — Persistence Access Conventions

## Goal
Make persistence access behavior consistent, explicit, and easy to follow for both humans and AI agents.

## What was added
- A dedicated conventions document: `docs/persistence-access-conventions.md`.
- Explicit default path: EF Core via direct `BitBetMaticDbContext` usage.
- Explicit anti-pattern guidance: no generic repository wrappers.
- Explicit query-service policy: use only when there is reuse or meaningful query complexity.
- Explicit raw SQL / Dapper exception policy with required guardrails.
- Cross-links in `README.md`, `docs/architecture-overview.md`, and `.agents/rules/project-context.md` so conventions are visible in normal developer and agent workflows.

## Why this approach
- Keeps the persistence model practical for current scope (foundation stage).
- Preserves EF Core-first development velocity.
- Prevents accidental drift into speculative abstraction layers.
- Retains a controlled escape hatch for measured performance needs.

## Non-goals reaffirmed
- No new product features.
- No expansion of persistence scope.
- No new persistence abstraction layers without immediate pressure.
