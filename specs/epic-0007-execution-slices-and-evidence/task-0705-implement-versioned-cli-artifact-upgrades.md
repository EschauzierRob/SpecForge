# Implement Versioned CLI Artifact Upgrades

## ID
T-0705

## Type
Task

## Parent
S-0705

## Summary
Implement versioned manifests, managed hashes, safe upgrade decisions, tooling status, and consumer CLI migration tests.

## Problem / Context
File existence is insufficient to decide whether an obsolete runtime can be replaced safely.

## Goals
- Add SHA-256 managed identities.
- Implement legacy and current artifact verification.
- Test upgrade, customization conflict, partial repair, and idempotency.

## Non-goals
- Add an interactive force-upgrade command.

## Requirements
- [ ] R1: Hash comparison uses normalized file bytes without modifying files during detection.
- [ ] R2: A skipped upgrade cannot install a current manifest beside an obsolete runtime.

## Acceptance Criteria
- [ ] AC1: All migration paths have deterministic test coverage.
- [ ] AC2: Full SpecForge tests and local validation pass.

## Dependencies
- T-0704

## Open Questions
- None

## Notes
None
