# Specs Directory

`/specs` contains **source-of-truth product specifications** only.

## Rules

- Do include product intent, requirements, and acceptance criteria.
- Do include semantic dependencies (e.g., feature depends on another capability).
- Do **not** include planning overlay fields (`rank`, `planningStatus`, `blocked`, sprint labels, etc.).
- Keep IDs stable once published.

## ID Pattern

- Epic: `E-####`
- Feature: `F-####`
- Story: `S-####`
- Task: `T-####`

## Hierarchy

Epic → Feature → Story → Task

## File and Folder Naming

- Epic folders: `epic-####-slug`
- Epic file: `epic.md`
- Feature files: `feature-####-slug.md`
- Story files: `story-####-slug.md`
- Task files: `task-####-slug.md`

## Authoring Guidance

- Start from templates in `specs/templates/`.
- Provide concrete acceptance criteria.
- Keep summaries short and explicit.
- Put unresolved decisions in **Open Questions**.
