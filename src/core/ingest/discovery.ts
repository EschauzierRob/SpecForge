import { access, readdir } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";

import type {
  RepositoryAdapterOptions,
  RepositoryDiscovery,
} from "../model/types.ts";
import { bootstrapWorkspace } from "./bootstrap.ts";
import type { RepositoryAdapter } from "./adapters/types.ts";
import { resolveRepositoryAdapter } from "./adapters/index.ts";

const ignoredDirectoryNames = new Set([".git", "node_modules", "dist"]);
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
  adapter: RepositoryAdapter,
  discoveredSpecFiles: string[],
  adapterIncludedSpecFiles: string[],
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
      await walkSpecFiles(fullPath, rootPath, adapter, discoveredSpecFiles, adapterIncludedSpecFiles, ignoredEntries);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const acceptance = adapter.discoverCandidates(relativePath);
    if (!acceptance.include) {
      continue;
    }

    discoveredSpecFiles.push(relativePath);
    if (acceptance.adapterOnly) {
      adapterIncludedSpecFiles.push(relativePath);
    }
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

export async function discoverRepository(
  repoPath: string,
  options: RepositoryAdapterOptions = {},
): Promise<RepositoryDiscovery> {
  const { adapter } = resolveRepositoryAdapter(options);
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
  const adapterIncludedSpecFiles: string[] = [];
  const discoveredOverlayFiles: string[] = [];
  const ignoredEntries: string[] = [];
  await walkSpecFiles(specsPath, repoRoot, adapter, discoveredSpecFiles, adapterIncludedSpecFiles, ignoredEntries);
  if (hasOverlayDirectory) {
    await walkOverlayFiles(overlayPath, repoRoot, discoveredOverlayFiles, ignoredEntries);
  }

  discoveredSpecFiles.sort((left, right) => left.localeCompare(right));
  adapterIncludedSpecFiles.sort((left, right) => left.localeCompare(right));
  discoveredOverlayFiles.sort((left, right) => left.localeCompare(right));
  ignoredEntries.sort((left, right) => left.localeCompare(right));

  return {
    repoRoot,
    specsPath: normalizePath(path.relative(repoRoot, specsPath)) || "specs",
    overlayPath: normalizePath(path.relative(repoRoot, overlayPath)) || "specforge/overlay",
    specDiscoveryProfile: adapter.profile,
    validationProfile: adapter.validationProfile(),
    hasOverlayDirectory,
    discoveredSpecFiles,
    adapterIncludedSpecFiles,
    discoveredOverlayFiles,
    specFileCount: discoveredSpecFiles.length,
    overlayFileCount: discoveredOverlayFiles.length,
    ignoredEntries,
    missingExpectedDirectories,
    bootstrap,
  };
}
