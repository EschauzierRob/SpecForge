# Document UI Annotations for Inferred Edges

## ID
T-0503

## Type
Task

## Parent
S-0503

## Summary
Define UX annotation patterns for inferred relationships, virtual nodes, and drift hotspot indicators.

## Problem / Context
UI implementation needs explicit guidelines for representing inferred structure clearly and consistently.

## Goals
- Specify visual and textual indicators for inference state.
- Define interaction patterns for ambiguity inspection.

## Non-goals
- Building UI components.

## Requirements
- [ ] R1: Documentation covers annotation states for explicit edge, inferred edge, and low-confidence inferred edge.
- [ ] R2: Documentation defines how warnings deep-link to affected hierarchy nodes.
- [ ] R3: Documentation covers virtual or synthesized node annotations when projection needs hierarchy placeholders.
- [ ] R4: Annotation guidance includes non-color visual or textual cues for accessibility.

## Acceptance Criteria
- [ ] AC1: Annotation guidance is specific enough to produce consistent tree/detail rendering.
- [ ] AC2: UX notes include accessibility considerations for non-color cues.
- [ ] AC3: Guidance defines where inference rationale appears in tree/detail/warnings flows.

## Dependencies
- S-0503

## Open Questions
- Should inferred edge rationale be shown inline, tooltip-only, or side panel only?

## Notes
Documentation-only task for front-end planning and design alignment.
