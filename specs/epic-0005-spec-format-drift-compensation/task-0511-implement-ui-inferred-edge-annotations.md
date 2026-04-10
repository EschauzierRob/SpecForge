# Implement UI Inferred Edge Annotations

## ID
T-0511

## Type
Task

## Parent
S-0503

## Summary
Implement tree and detail UI annotations for explicit, inferred, low-confidence, and virtual hierarchy states.

## Problem / Context
Users need visible, accessible indicators that separate source-backed structure from inferred or uncertain structure.

## Goals
- Show explicit versus inferred relationship state.
- Surface confidence and evidence in context.
- Use non-color cues for accessibility.

## Non-goals
- Designing a full graph debugger.

## Requirements
- [ ] R1: Tree and detail surfaces show explicit, inferred, low-confidence, and virtual/synthesized states.
- [ ] R2: Inference rationale is inspectable without reading raw markdown.
- [ ] R3: Visual treatment includes labels, icons, or text cues in addition to color.

## Acceptance Criteria
- [ ] AC1: Users can identify inferred and low-confidence structure from the tree/detail surfaces.
- [ ] AC2: Annotation UI passes existing accessibility expectations for non-color cues.
- [ ] AC3: Tests or state selectors cover annotation data mapping.

## Dependencies
- S-0503
- T-0503
- T-0510

## Open Questions
- Should confidence rationale appear inline, in a popover, or in the detail panel for MVP?

## Notes
Implementation task for visible inferred-structure annotations.
