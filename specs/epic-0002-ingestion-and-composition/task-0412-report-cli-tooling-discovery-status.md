# Report CLI Tooling Discovery Status

## ID
T-0412

## Type
Task

## Parent
S-0411

## Summary
Expose local SpecForge CLI availability in repository discovery results.

## Problem / Context
Codex and UI/API consumers need a machine-readable signal that local SpecForge CLI tooling exists.

## Goals
- Add `cliTooling` to discovery output.
- Report availability, launcher paths, runtime path, manifest path, and version.
- Include CLI tooling status in human CLI summaries.

## Non-goals
- Validating artifact hashes.

## Requirements
- [ ] R1: Discovery returns `available`, `missing`, or `partial`.
- [ ] R2: Discovery includes detected launcher and runtime metadata.
- [ ] R3: CLI summaries show the tooling status.

## Acceptance Criteria
- [ ] AC1: JSON outputs include the `cliTooling` contract.
- [ ] AC2: Human summary output includes `specforge cli tooling: available`.

## Dependencies
- T-0411

## Open Questions
- None

## Notes
The status is based on required local files, not global PATH.
