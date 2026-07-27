# Synchronize Workspace URL State

## ID
T-0202

## Type
Task

## Parent
S-0202

## Summary
Implement a pure URL-state contract and connect it to workspace loading and browser history.

## Problem / Context
URL parsing and serialization must be deterministic so bookmark restoration, browser navigation, and UI actions all agree on the same workspace state.

## Goals
- Provide stable tab URL values and preserve unrelated query parameters.
- Prevent out-of-order repository loads from replacing a newer URL state.
- Cover URL parsing, serialization, and reducer restoration with regression tests.

## Non-goals
- Add a router library or change the HTTP API.

## Requirements
- [x] R1: A pure client-side module parses and serializes `repo`, `tab`, and `item` values.
- [x] R2: UI navigation writes one combined history entry when an action changes both selection and tab.
- [x] R3: Asynchronous responses are ignored when their requested repository is no longer current.

## Acceptance Criteria
- [x] AC1: URL-state tests cover Windows-path encoding, tab fallback, selected-item restoration, and unrelated query preservation.
- [x] AC2: The UI production build and full test suite pass with URL synchronization enabled.

## Dependencies
- S-0202

## Open Questions
- None

## Notes
`tab` uses stable kebab-case values while the UI retains its display labels.
