import { constants } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { WorkspaceBootstrapAction, WorkspaceBootstrapSummary } from "../model/types.ts";
import { bootstrapSpecForgeCliTooling } from "./cli-tooling.ts";

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}

async function exists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function createDefaultOverlayFile(repoRoot: string): string {
  const repositoryId = path.basename(repoRoot).trim() || "specforge-local";
  return `${JSON.stringify(
    {
      version: "0.1",
      repositoryId,
      entries: [],
    },
    null,
    2,
  )}\n`;
}

function createSpecforgeReadme(): string {
  return `# SpecForge Workspace

This directory contains SpecForge metadata for this repository.

## Layout

- \`overlay/\` stores planning and execution metadata outside canonical specs.
- \`ai-coder-instructions.md\` tells AI coding agents how to work in this repo.

## Rules

- Keep product intent in \`/specs\`.
- Keep planning and execution metadata in \`specforge/overlay/local-dev.overlay.json\`.
- Do not copy overlay fields into spec markdown files.
- Read \`specforge/ai-coder-instructions.md\` before making AI-assisted changes.
`;
}

function createOverlayReadme(): string {
  return `# Overlay Metadata

Overlay files store planning and execution metadata independent of product specs.

## Local Overlay

Use \`specforge/overlay/local-dev.overlay.json\` for local planning state.

## Rules

- Entries link to specs by stable \`specId\`.
- Supported planning statuses are \`backlog\`, \`ready\`, \`in_progress\`, \`blocked\`, and \`done\`.
- Keep overlay metadata out of \`/specs\` markdown.
- AI-assisted implementation must update overlay entries for changed target spec IDs.
`;
}

function createAiCoderInstructions(): string {
  return `# AI Coder Instructions

Follow these rules for AI-assisted implementation in this repository.

## Required Workflow

1. Read \`/specs\` before implementing so product intent, hierarchy, and acceptance criteria are clear.
2. Keep product intent and requirements in \`/specs\`.
3. Keep planning and execution metadata in \`specforge/overlay/local-dev.overlay.json\`.
4. Before editing, identify every target spec ID that the change advances.
5. Ensure each changed target spec ID has an overlay entry.
6. After editing, update stale overlay fields for changed work:
   - \`planningStatus\`
   - \`blocked\`
   - \`blockedReason\`
   - \`dependencies\`
   - \`notes\`
   - \`tags\`
7. Run SpecForge parse, compose, and validate checks before finishing when the toolchain is available.

Preferred local commands:

- \`specforge/bin/specforge parse .\`
- \`specforge/bin/specforge compose .\`
- \`specforge/bin/specforge validate .\`

When working inside the SpecForge source repository itself, this fallback is also valid:

- \`node --experimental-strip-types ./src/cli.ts validate .\`

## Canonical Spec Authoring

When creating or editing specs, use the SpecForge canonical markdown format. Do not use YAML frontmatter.

Valid canonical types are exactly:

- \`Epic\`
- \`Feature\`
- \`Story\`
- \`Task\`

Each canonical spec file must use these sections:

\`\`\`markdown
# <Title>

## ID
<E-0000 | F-0000 | S-0000 | T-0000>

## Type
<Epic | Feature | Story | Task>

## Parent
<direct parent ID or None>

## Summary
<short summary>

## Problem / Context
<context>

## Goals
- <goal>

## Non-goals
- <non-goal>

## Requirements
- [ ] R1: <requirement>

## Acceptance Criteria
- [ ] AC1: <observable outcome>

## Dependencies
- <semantic/product spec ID dependency or None>

## Open Questions
- <question or None>

## Notes
<notes or None>
\`\`\`

Hierarchy is \`Epic -> Feature -> Story -> Task\`. Every non-epic spec must set \`## Parent\` to its direct parent ID. Do not rely on markdown nesting to imply hierarchy.

Use one directory per epic:

\`\`\`text
specs/
  epic-0001-short-name/
    epic.md
    feature-0001-short-name.md
    story-0001-short-name.md
    task-0001-short-name.md
\`\`\`

Each feature, story, and task must be its own canonical file. Do not embed feature, story, or task specs as subsections inside an epic or parent spec. When generating implementation-ready work, use the full hierarchy where meaningful instead of collapsing stories and tasks into feature bullets.

## Overlay Entry Shape

Overlay entries link to canonical specs by the value in the spec's \`## ID\` section. A minimal local overlay entry is:

\`\`\`json
{
  "specId": "T-0000",
  "planningStatus": "in_progress"
}
\`\`\`

Allowed \`planningStatus\` values are \`backlog\`, \`ready\`, \`in_progress\`, \`blocked\`, and \`done\`.

## Boundary

Canonical \`## Dependencies\` sections contain semantic/product spec ID dependencies. Overlay \`dependencies\` contains planning or execution metadata.

Do not rewrite canonical specs just to record execution status. Use the overlay file for execution state.
`;
}

function createAgentsInstructions(): string {
  return `# Repository Instructions

This repository uses SpecForge for spec-driven planning.

Before AI-assisted implementation, read \`specforge/ai-coder-instructions.md\` and follow the SpecForge workflow for specs and overlay metadata.
`;
}

function createAction(
  kind: WorkspaceBootstrapAction["kind"],
  relativePath: string,
): WorkspaceBootstrapAction {
  return {
    kind,
    path: normalizePath(relativePath),
  };
}

export async function bootstrapWorkspace(repoRoot: string): Promise<WorkspaceBootstrapSummary> {
  const specforgePath = path.join(repoRoot, "specforge");
  const binPath = path.join(specforgePath, "bin");
  const overlayPath = path.join(specforgePath, "overlay");
  const toolsPath = path.join(specforgePath, "tools");
  const specforgeReadmePath = path.join(specforgePath, "README.md");
  const overlayReadmePath = path.join(overlayPath, "README.md");
  const overlayFilePath = path.join(overlayPath, "local-dev.overlay.json");
  const aiCoderInstructionsPath = path.join(specforgePath, "ai-coder-instructions.md");
  const agentsPath = path.join(repoRoot, "AGENTS.md");
  const actions: WorkspaceBootstrapAction[] = [];

  if (!await exists(specforgePath)) {
    await mkdir(specforgePath, { recursive: true });
    actions.push(createAction("directory", "specforge"));
  }

  if (!await exists(overlayPath)) {
    await mkdir(overlayPath, { recursive: true });
    actions.push(createAction("directory", "specforge/overlay"));
  }

  if (!await exists(binPath)) {
    await mkdir(binPath, { recursive: true });
    actions.push(createAction("directory", "specforge/bin"));
  }

  if (!await exists(toolsPath)) {
    await mkdir(toolsPath, { recursive: true });
    actions.push(createAction("directory", "specforge/tools"));
  }

  if (!await exists(specforgeReadmePath)) {
    await writeFile(specforgeReadmePath, createSpecforgeReadme(), "utf8");
    actions.push(createAction("file", "specforge/README.md"));
  }

  if (!await exists(overlayReadmePath)) {
    await writeFile(overlayReadmePath, createOverlayReadme(), "utf8");
    actions.push(createAction("file", "specforge/overlay/README.md"));
  }

  if (!await exists(overlayFilePath)) {
    await writeFile(overlayFilePath, createDefaultOverlayFile(repoRoot), "utf8");
    actions.push(createAction("file", "specforge/overlay/local-dev.overlay.json"));
  }

  if (!await exists(aiCoderInstructionsPath)) {
    await writeFile(aiCoderInstructionsPath, createAiCoderInstructions(), "utf8");
    actions.push(createAction("file", "specforge/ai-coder-instructions.md"));
  }

  if (!await exists(agentsPath)) {
    await writeFile(agentsPath, createAgentsInstructions(), "utf8");
    actions.push(createAction("file", "AGENTS.md"));
  }

  actions.push(...await bootstrapSpecForgeCliTooling(repoRoot));

  return {
    actions,
    createdCount: actions.length,
  };
}
