# Business Case

## Problem Statement

Teams that practice spec-driven development often struggle to keep planning decisions separate from product intent. As a result:

- specification files become polluted with tactical status fields
- planning discussions rewrite source-of-truth artifacts
- product understanding degrades over time
- execution ordering is hard to reason about

## Strategic Position

SpecForge formalizes a two-layer model:

1. **Specs define what can be built** (domain truth)
2. **SpecForge overlay defines what should come next** (planning projection)

This enables high trust in specs while allowing rapid planning iteration.

## Value Proposition

SpecForge delivers value by making it cheap to answer:

- Is the spec set coherent?
- What work is blocked?
- What is the highest-value actionable next item?

### Benefits

- **Cleaner specs:** product artifacts stay stable and reviewable
- **Faster planning:** planning metadata can evolve independently
- **Lower coordination cost:** shared canonical hierarchy aligns product and engineering
- **Reduced execution risk:** built-in validation catches structural defects early

## MVP Scope and Rationale

### MVP characteristics

- Local-first
- Read-only against source specs
- Overlay loaded from repository files
- Validation warnings exposed in UI
- Basic recommendation of next work

### Why read-only first

A read-only MVP minimizes risk and complexity while proving the core architecture:

- parse + normalize specs
- compose with overlay metadata
- project into practical planning views

This creates immediate internal utility and a safe base for future write workflows.

## Operating Assumptions

- Teams already store specs in git repositories
- Teams can adopt stable IDs for spec items
- Planning metadata changes more frequently than product intent
- Initial users prioritize clarity and actionability over workflow automation

## Future Expansion (Post-MVP)

The architecture is intentionally extensible for:

1. **External repository support** (remote fetch, multiple sources)
2. **Drift compensation** (robust matching when IDs/paths change)
3. **Write capabilities** (controlled updates to overlay and eventually safe spec assistance)

## Success Indicators

- Users can onboard a spec repository in minutes
- Validation catches real structural issues before implementation
- Teams use “recommended next work” as a daily planning aid
- Spec files remain free of tactical planning noise over time
