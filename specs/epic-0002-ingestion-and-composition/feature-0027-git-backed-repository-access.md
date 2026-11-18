# Git-Backed Repository Access

## ID
F-0027

## Type
Feature

## Parent
E-0002

## Summary
Allow SpecForge to load and refresh a read-only project from a remote Git repository while preserving local-filesystem project access.

## Problem / Context
SpecForge currently identifies and acquires a project through a local filesystem path. A hosted SpecForge server therefore cannot inspect a developer's project unless that filesystem is directly available to the server. Remote Git repositories provide a source that the server can acquire independently, including private repositories when an administrator has configured suitable credentials.

## Goals
- Add Git-backed projects as an additional project source without changing local-filesystem behavior.
- Acquire and refresh a server-side working copy at an explicitly reported remote revision.
- Support authenticated read access without exposing credential material.
- Feed acquired content through the existing discovery, parsing, overlay, validation, and presentation behavior.
- Keep source acquisition and source capabilities separate from the canonical spec and overlay domain models.

## Non-goals
- Commit, push, branch, merge, or open pull requests from SpecForge.
- Create or edit canonical specs, overlays, or bootstrap artifacts in a Git-backed working copy.
- Schedule synchronization or autonomous implementation.
- Orchestrate local, external, or cloud coding agents.
- Require GitHub-specific project semantics where standard Git repository semantics suffice.

## Requirements
- [ ] R1: A project source explicitly distinguishes a local filesystem source from a Git source; a local source retains its existing path behavior, while a Git source identifies a remote repository and a branch, tag, or commit selection without treating a developer-machine absolute path as project identity.
- [ ] R2: SpecForge can obtain a server-managed working copy of a reachable Git repository and load it through the same repository discovery and ingestion boundary used for local projects.
- [ ] R3: Git-backed access is read-only for this feature, and its source capability is exposed so write-oriented flows, including bootstrap and authoring, can refuse mutation before changing the working copy.
- [ ] R4: A Git source can refer to a public repository or select a configured credential for a private repository; project configuration and user-visible responses use an opaque credential reference and never require or return the secret itself.
- [ ] R5: Credential secrets are not written into canonical specs, development overlays, repository content, remote URLs shown to users, diagnostics, or logs, and are supplied only to the Git operation that requires them with the minimum configured read access.
- [ ] R6: Each load reports synchronization status, the resolved commit identifier being inspected, the time of the last successful synchronization, and whether the displayed content is current for the requested remote selection.
- [ ] R7: An explicit refresh attempts to resolve and acquire the latest commit reachable from the configured branch or tag; an immutable commit selection remains pinned to that commit.
- [ ] R8: If initial acquisition has never succeeded, a clone, authentication, authorization, selection, or network failure prevents project loading and produces an actionable error that distinguishes the failure category without revealing credentials.
- [ ] R9: If refresh fails after a prior successful synchronization, SpecForge may continue presenting the last successfully acquired revision only when it labels the view stale, preserves the failed-attempt status, and reports both the displayed commit and last-success time; it must not represent the working copy as current or partially update it.
- [ ] R10: Once a working copy is successfully acquired, canonical parsing, development-overlay composition, validation, diagnostics, and user-facing project content are source-agnostic and remain consistent with the same repository tree loaded locally.
- [ ] R11: Concurrent loads or refreshes of the same Git-backed project cannot expose a partially cloned, checked-out, or updated repository tree to ingestion.
- [ ] R12: Source metadata keeps the Git remote identity and requested selection distinct from the server-internal working-copy path, and consumers do not expose that internal path as the project's durable or bookmarkable identifier.

## Acceptance Criteria
- [ ] AC1: A user can register or select a public Git repository and load its canonical specs and development overlay without the server having access to the user's local project path.
- [ ] AC2: A private Git repository loads when a valid configured read credential is selected, while missing or invalid credentials yield a sanitized, actionable failure and no repository content.
- [ ] AC3: Local-filesystem projects continue to load with their existing behavior after Git-backed sources are introduced.
- [ ] AC4: Loading equivalent commits through a local working tree and a Git-backed working copy produces equivalent canonical nodes, overlay facets, validation findings, and displayed spec content except for source-specific provenance and synchronization metadata.
- [ ] AC5: After the tracked remote branch advances, a successful explicit refresh atomically switches the inspected content to the new resolved commit and reports that commit as current.
- [ ] AC6: After a successful load, a failed refresh leaves the prior complete revision inspectable, visibly marks it stale, and reports a sanitized synchronization error; a failed first load displays no project as successfully loaded.
- [ ] AC7: Git-backed load and refresh do not modify tracked or untracked content in the acquired revision and do not invoke bootstrap or authoring writes.
- [ ] AC8: GitHub-hosted and non-GitHub Git remotes that use the supported transport and credentials follow the same source contract without GitHub-only fields in the canonical project model.

## Dependencies
- F-0004
- F-0005
- F-0006
- F-0014

## Open Questions
- Which remote URL schemes and credential kinds must the first implementation support (for example HTTPS token, SSH key, or both)?
- Is a branch the required default selection, or must users always choose a branch, tag, or commit explicitly?
- What retention, eviction, and isolation policy should govern server-managed working copies?
- Which roles may create Git-backed project definitions or select configured credential references?

## Notes
The initial boundary is deliberately read-only and refresh-on-demand. A future capability may add a write-capable Git source that stages reviewed planning or overlay changes on branches and commits for external agents to consume, but that capability requires separate authorization, concurrency, audit, and delivery specifications. The acquisition boundary should therefore advertise capabilities and preserve remote/revision provenance rather than embedding local-path or read-only assumptions throughout the domain.
