import { access, readdir } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";

import type { RepositoryDiscovery } from "../model/types.ts";
import { bootstrapWorkspace } from "./bootstrap.ts";

const ignoredDirectoryNames = new Set([".git", "node_modules", "dist"]);
const specFilePattern = /^(epic\.md|feature-\d{4}-.+\.md|story-\d{4}-.+\.md|task-\d{4}-.+\.md)$/i;
const overlayFilePattern = /\.overlay\.json$/i;

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}

function shouldIgnore(name: string): boolean {
  return ignoredDirectoryNames.has(name) || name.startsWith(".");
}

function shouldIgnoreOverlay(name: string): boolean {
  return shouldIgnore(name) || name === "schema";
}

function shouldIgnoreOverlayFile(relativePath: string): boolean {
  return relativePath === "specforge/overlay/examples/local-dev.overlay.json";
}

async function walkSpecFiles(
  currentPath: string,
  rootPath: string,
  discoveredSpecFiles: string[],
  ignoredEntries: string[],
): Promise<void> {
  const entries = await readdir(currentPath, { withFileTypes: true });
  const sortedEntries = [...entries].sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of sortedEntries) {
    const fullPath = path.join(currentPath, entry.name);
    const relativePath = normalizePath(path.relative(rootPath, fullPath));

    if (shouldIgnore(entry.name)) {
      ignoredEntries.push(relativePath);
      continue;
    }

    if (entry.isDirectory()) {
      await walkSpecFiles(fullPath, rootPath, discoveredSpecFiles, ignoredEntries);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!specFilePattern.test(entry.name)) {
      continue;
    }

    discoveredSpecFiles.push(relativePath);
  }
}

async function walkOverlayFiles(
  currentPath: string,
  rootPath: string,
  discoveredOverlayFiles: string[],
  ignoredEntries: string[],
): Promise<void> {
  const entries = await readdir(currentPath, { withFileTypes: true });
  const sortedEntries = [...entries].sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of sortedEntries) {
    const fullPath = path.join(currentPath, entry.name);
    const relativePath = normalizePath(path.relative(rootPath, fullPath));

    if (shouldIgnoreOverlay(entry.name)) {
      ignoredEntries.push(relativePath);
      continue;
    }

    if (entry.isDirectory()) {
      await walkOverlayFiles(fullPath, rootPath, discoveredOverlayFiles, ignoredEntries);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (shouldIgnoreOverlayFile(relativePath)) {
      ignoredEntries.push(relativePath);
      continue;
    }

    if (!overlayFilePattern.test(entry.name)) {
      continue;
    }

    discoveredOverlayFiles.push(relativePath);
  }
}

export async function discoverOverlayFiles(repoRoot: string): Promise<string[]> {
  const overlayPath = path.join(repoRoot, "specforge", "overlay");

  try {
    await access(overlayPath, constants.R_OK);
  } catch {
    return [];
  }

  const discoveredOverlayFiles: string[] = [];
  await walkOverlayFiles(overlayPath, repoRoot, discoveredOverlayFiles, []);
  discoveredOverlayFiles.sort((left, right) => left.localeCompare(right));
  return discoveredOverlayFiles;
}

export async function discoverRepository(repoPath: string): Promise<RepositoryDiscovery> {
  const repoRoot = path.resolve(repoPath);

  await access(repoRoot, constants.R_OK);

  const specsPath = path.join(repoRoot, "specs");
  const overlayPath = path.join(repoRoot, "specforge", "overlay");
  const missingExpectedDirectories: string[] = [];

  try {
    await access(specsPath, constants.R_OK);
  } catch {
    missingExpectedDirectories.push("specs");
  }

  if (missingExpectedDirectories.length > 0) {
    throw new Error(`Missing expected directory: ${missingExpectedDirectories.join(", ")}`);
  }

  const bootstrap = await bootstrapWorkspace(repoRoot);

  let hasOverlayDirectory = true;
  try {
    await access(overlayPath, constants.R_OK);
  } catch {
    hasOverlayDirectory = false;
    missingExpectedDirectories.push("specforge/overlay");
  }

  const discoveredSpecFiles: string[] = [];
  const discoveredOverlayFiles: string[] = [];
  const ignoredEntries: string[] = [];
  await walkSpecFiles(specsPath, repoRoot, discoveredSpecFiles, ignoredEntries);
  if (hasOverlayDirectory) {
    await walkOverlayFiles(overlayPath, repoRoot, discoveredOverlayFiles, ignoredEntries);
  }

  discoveredSpecFiles.sort((left, right) => left.localeCompare(right));
  discoveredOverlayFiles.sort((left, right) => left.localeCompare(right));
  ignoredEntries.sort((left, right) => left.localeCompare(right));

  return {
    repoRoot,
    specsPath: normalizePath(path.relative(repoRoot, specsPath)) || "specs",
    overlayPath: normalizePath(path.relative(repoRoot, overlayPath)) || "specforge/overlay",
    hasOverlayDirectory,
    discoveredSpecFiles,
    discoveredOverlayFiles,
    specFileCount: discoveredSpecFiles.length,
    overlayFileCount: discoveredOverlayFiles.length,
    ignoredEntries,
    missingExpectedDirectories,
    bootstrap,
  };
}
