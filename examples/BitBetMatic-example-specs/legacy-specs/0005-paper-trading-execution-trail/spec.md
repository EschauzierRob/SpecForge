# 0005 — Paper-Trading Execution Trail

## Overview
Epic 0005 introduces a controllable, observable paper-trading runtime focused on execution trail integrity, operator visibility, and auditability.

This epic is not a full execution engine. It is a narrow MVP runtime that records the full decision-to-simulated-outcome chain.

## Objective
Deliver a minimal paper-trading runtime where every signal-driven action is traceable through deterministic state transitions and persisted audit events.

## Scope
### In scope
- Event trail for: signal received, decision made, simulated order created, simulated fill/rejection, position state update, audit event logged.
- Explicit paper execution state machine and transition rules.
- Persistence of execution/audit events for operator review.
- Operator-facing visibility for current position/exposure and recent execution trail.
- Guardrails that prioritize safe, understandable behavior over realism.

### Out of scope
- Full exchange-specific execution behavior.
- Advanced order types and routing logic.
- High-fidelity market microstructure simulation.
- Live trading connectivity.

## Hard constraints (non-negotiable)
- Every event in one signal lifecycle must carry correlation identifiers linking signal, decision, order, and resulting position mutation.
- State transitions must be validated against an explicit transition map; invalid transitions must be rejected and audited.
- A position mutation without a corresponding persisted event chain is invalid.
- Rejections must include machine-usable reason codes and human-readable reason text.
- MVP runtime must remain single-venue paper simulation; adding exchange realism within this epic is scope creep.

## Success criteria
- Every processed signal yields a traceable event chain with stable identifiers and timestamps.
- Paper order lifecycle transitions are explicit, valid, and auditable.
- Rejections include concrete reasons tied to guardrails/state conditions.
- Position state updates are consistent with simulated fills and persisted trail.
- Operators can inspect recent decisions/outcomes without deep code inspection.

## Failure criteria
- Signals can change position state without a corresponding audit trail.
- Rejections or fills happen without explicit event evidence.
- Runtime behavior is opaque to operators.
- Scope drifts into complex exchange realism before trail integrity is solid.

## Architectural impact
- Extends live-trading module from contract-only state to paper-runtime behavior.
- Introduces execution-trail persistence/read model expectations.
- Adds operational visibility hooks consumed by API/dashboard surfaces.
- Reinforces deterministic and auditable runtime principles from prior epics.

## Risks
- Over-expanding into realism can block core auditability goals.
- Under-specified event model can create ambiguous state transitions.
- Weak operator visibility can slow incident triage and trust.

## Open questions
- What minimum operator-facing views are mandatory for MVP sign-off?
- Should partial fills be explicitly unsupported in v1 (with rejection code) or simplified into full-fill-only semantics?
- Is deterministic replay of event chains a required gate in this epic or immediate follow-up?

## Implementation order
1. Lock event taxonomy, correlation model, and transition map.
2. Implement minimal signal -> decision -> simulated order -> fill/reject flow.
3. Persist execution events and position snapshots with strict correlation rules.
4. Expose operator read models for current state and recent execution trail.
5. Add deterministic transition and trail-completeness tests as release gate.

## Initial feature decomposition
1. **Feature A: Event Model and State Machine Baseline**  
   Canonical event types, required fields, and allowed transition graph.
2. **Feature B: Minimal Paper Execution Runtime**  
   Signal intake, decision step, simulated order/fill/reject behavior.
3. **Feature C: Audit Trail Persistence and Correlation**  
   Durable event storage and traceability across one signal lifecycle.
4. **Feature D: Operator Visibility and Guardrails**  
   Basic runtime observability with explicit rejection/guardrail semantics.
