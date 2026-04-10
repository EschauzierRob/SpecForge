# Visualize Inferred Structure and Drift

## ID
S-0503

## Type
Story

## Parent
F-0017

## Summary
As a user exploring a loaded repository, I can distinguish explicit vs inferred structure and inspect drift directly in the UI.

## Problem / Context
A rendered hierarchy is only trustworthy if users can tell which parts are inferred and why.

## Goals
- Make inferred relationships visually distinct.
- Expose confidence and drift annotations in context.
- Enable navigation from warning findings to affected hierarchy nodes or inferred edges.

## Non-goals
- Hiding ambiguity to keep UI minimal.

## Requirements
- [ ] R1: Tree and detail surfaces show explicit/inferred relationship states.
- [ ] R2: Node/edge inspection reveals confidence and inference evidence.
- [ ] R3: Warning navigation can focus the affected node, edge, or drift hotspot when the target is resolvable.

## Acceptance Criteria
- [ ] AC1: Users can identify low-confidence edges without reading raw markdown files.
- [ ] AC2: Drift hotspots are highlighted and navigable from warnings to affected nodes.
- [ ] AC3: Inferred-state markers include non-color cues for accessibility.

## Dependencies
- F-0007
- F-0009
- F-0011
- F-0016

## Open Questions
- What visual encoding best balances accessibility and density for inferred-state markers?

## Notes
Story focused on UX of inferred structure transparency.
