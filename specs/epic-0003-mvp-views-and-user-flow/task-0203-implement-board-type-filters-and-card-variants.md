# Implement Board Type Filters and Card Variants

## ID
T-0203

## Type
Task

## Parent
S-0203

## Summary
Extend Board filtering and card rendering with independently selectable types and accessible visual variants.

## Problem / Context
The current Board has blocked and dependency quick filters but no type selection, and every type uses the same card presentation.

## Goals
- Implement the focused default and recognizable type treatments.

## Non-goals
- Filter persistence, tag-filter implementation, or shared API changes.

## Requirements
- [ ] R1: Extend the Board filter contract and selector with selected canonical types; combine them with existing quick filters without mutating source nodes.
- [ ] R2: Initialize Feature and Story selection in Board-local state and reset on Board re-entry or repository change, while retaining state during detail interactions and data refresh.
- [ ] R3: Render labeled type controls and type-specific card classes with visible type text and a non-color distinction; preserve active, blocked, and dependency treatments.
- [ ] R4: Support an empty type selection and a no-matches message without reloading repository data.

## Acceptance Criteria
- [ ] AC1: Selector regressions cover all sixteen type selections and their intersections with both quick filters.
- [ ] AC2: Browser review confirms default/reset behavior, retained filters during details and refresh, keyboard control operation, and recognizable selected/blocked card variants.

## Dependencies
- S-0203

## Open Questions
- None

## Notes
Primary integration points are the existing Board component, Board selectors, and UI styles. Keep workspace URL state unchanged.
