# Upgrade Managed Consumer CLI

## ID
S-0705

## Type
Story

## Parent
F-0025

## Summary
As a consumer owner, I want recognized repository-local SpecForge CLI artifacts upgraded so that local parse, compose, and validate commands understand slices.

## Problem / Context
The current bootstrap fills missing CLI files but never replaces an obsolete managed runtime.

## Goals
- Version and hash generated CLI artifacts.
- Upgrade verified legacy tooling atomically at file granularity.
- Preserve customized artifacts and expose an outdated state.

## Non-goals
- Overwrite unverified tools.
- Publish the CLI through a package registry.

## Requirements
- [ ] R1: The v0.2 manifest contains SHA-256 identities for managed files.
- [ ] R2: Legacy v0.1 artifacts upgrade only when their content matches known generated identities.
- [ ] R3: Current manifests verify managed identities before future replacement.
- [ ] R4: Detection distinguishes current, outdated, customized, partial, and missing tooling where evidence permits.

## Acceptance Criteria
- [ ] AC1: An untouched v0.1 CLI upgrades to v0.2 and reports updated files.
- [ ] AC2: The upgraded local CLI composes executionSlices and enforces thematic WIP.
- [ ] AC3: A changed legacy runtime remains unchanged and the upgrade is reported as skipped.
- [ ] AC4: Removing a current managed artifact repairs it without rewriting healthy artifacts.

## Dependencies
- F-0022
- S-0704

## Open Questions
- None

## Notes
Managed identity excludes the manifest itself to avoid a self-referential hash.
