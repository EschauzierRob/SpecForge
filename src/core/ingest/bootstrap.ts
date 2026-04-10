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
  const overlayFilePath = path.join(overlayPath, "local-dev.overlay.json");
  const actions: WorkspaceBootstrapAction[] = [];

  if (!await exists(specforgePath)) {
    await mkdir(specforgePath, { recursive: true });
    actions.push(createAction("directory", "specforge"));
  }

  if (!await exists(overlayPath)) {
    await mkdir(overlayPath, { recursive: true });
    actions.push(createAction("directory", "specforge/overlay"));
  }

  if (!await exists(overlayFilePath)) {
    await writeFile(overlayFilePath, createDefaultOverlayFile(repoRoot), "utf8");
    actions.push(createAction("file", "specforge/overlay/local-dev.overlay.json"));
  }

  return {
    actions,
    createdCount: actions.length,
  };
}
