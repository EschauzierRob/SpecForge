# Clarifications — Epic 0005

## Resolved
- MVP emphasis is execution trail integrity and visibility, not simulation realism.
- Every major runtime step must emit a persisted audit event.
- Scope excludes exchange-specific behaviors and advanced order models.
- Rejections must provide both machine-usable reason codes and readable reason text.
- Position mutations without correlated event evidence are invalid behavior.

## Open questions
- What minimum operator-facing view set is mandatory for actionable monitoring?
- Should partial fills be explicitly unsupported in v1 or simplified into full-fill-only semantics?
- Is deterministic replay of event chains required in this epic or in immediate hardening follow-up?
