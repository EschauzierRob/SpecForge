# Bookmarkable Workspace URLs

## ID
F-0026

## Type
Feature

## Parent
E-0003

## Summary
Represent the loaded repository, active workspace tab, and selected spec item in a bookmarkable SpecForge URL.

## Problem / Context
The browser shell keeps workspace state only in memory, so a refresh loses the selected local repository and navigation context.

## Goals
- Restore a local repository workspace directly from a bookmark.
- Keep repository, tab, and selection synchronized with browser history.
- Make navigation state inspectable and shareable as a URL.

## Non-goals
- Maintain a server-side repository registry or named bookmark list.
- Hide local repository paths from browser history or shared links.

## Requirements
- [x] R1: The URL exposes `repo`, `tab`, and `item` query parameters with stable, URL-safe values.
- [x] R2: A non-empty `repo` URL parameter automatically loads the workspace and restores the requested tab and item when valid.
- [x] R3: Tab changes and item navigation update browser history; Back and Forward restore the corresponding workspace state.
- [x] R4: Missing or invalid tab and item values fall back safely without breaking the workspace.

## Acceptance Criteria
- [x] AC1: Refreshing a URL for a valid local repository restores its loaded workspace without another manual load click.
- [x] AC2: A bookmark can open a selected spec item on the requested workspace tab.
- [x] AC3: Browser Back and Forward restore repository changes and navigation context without stale load responses replacing the current state.

## Dependencies
- F-0009

## Open Questions
- None

## Notes
Repository paths in query parameters can appear in browser history, copied links, logs, and referrer headers; share these URLs only with trusted recipients.
