import { constants } from "node:fs";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { WorkspaceBootstrapAction, WorkspaceBootstrapSummary } from "../model/types.ts";

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

## Overlay Entry Shape

A minimal local overlay entry is:

\`\`\`json
{
  "specId": "T-0000",
  "planningStatus": "in_progress"
}
\`\`\`

Allowed \`planningStatus\` values are \`backlog\`, \`ready\`, \`in_progress\`, \`blocked\`, and \`done\`.

## Boundary

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
  const overlayPath = path.join(specforgePath, "overlay");
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

  return {
    actions,
    createdCount: actions.length,
  };
}
