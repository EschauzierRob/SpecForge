# Authenticate a Private Git-Backed Project

## ID
S-0802

## Type
Story

## Parent
F-0027

## Summary
As an authorized SpecForge user, I can load a private remote Git repository using an administrator-configured credential without seeing or embedding the secret.

## Problem / Context
Private repositories require authentication, but placing reusable secrets in project metadata, URLs, diagnostics, or repository files would create unacceptable disclosure risks.

## Goals
- Refer to credentials opaquely from project configuration.
- Apply least-privilege read credentials only during remote operations.
- Return useful authentication and authorization failures safely.

## Non-goals
- Define a particular secret manager or Git credential protocol.
- Let users retrieve configured credential values.

## Requirements
- [ ] R1: A Git project stores only a credential reference, while secret material remains in an access-controlled credential facility outside canonical specs, overlays, and repository content.
- [ ] R2: Only authorized operations can select or use a credential reference, and credential use is scoped to the configured remote operation.
- [ ] R3: Logs and user-visible errors redact credentials, including secrets embedded accidentally in submitted remote URLs.

## Acceptance Criteria
- [ ] AC1: A configured valid credential permits read acquisition of a private repository.
- [ ] AC2: A missing, invalid, or unauthorized credential fails without attempting anonymous fallback that could obscure the cause and without exposing secret material.
- [ ] AC3: Persisted project metadata, API responses, logs, and diagnostics contain no credential secret after load or failure.

## Dependencies
- S-0801

## Open Questions
- Which administrative audit events are required for credential creation, selection, and use?

## Notes
Credential storage technology is an implementation decision, but secrecy, authorization, redaction, and least-privilege behavior are required.
