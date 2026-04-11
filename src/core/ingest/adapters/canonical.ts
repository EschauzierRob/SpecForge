import path from "node:path";

import type { InferenceResult } from "../../model/types.ts";
import { parseSpecFile } from "../../parser/map.ts";
import { inferHierarchyRelationships } from "../inference.ts";
import type { RepositoryAdapter } from "./types.ts";

const canonicalSpecFilePattern = /^(epic\.md|feature-\d{4}-.+\.md|story-\d{4}-.+\.md|task-\d{4}-.+\.md)$/i;

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}

function shouldIgnoreSpecFile(relativePath: string): boolean {
  const normalizedPath = normalizePath(relativePath);
  const fileName = path.basename(normalizedPath);

  if (!fileName.toLowerCase().endsWith(".md")) {
    return true;
  }

  if (canonicalSpecFilePattern.test(fileName)) {
    return false;
  }

  return fileName.toLowerCase() === "readme.md" || normalizedPath.startsWith("specs/templates/");
}

export const canonicalRepositoryAdapter: RepositoryAdapter = {
  profile: "canonical",
  discoverCandidates(relativePath) {
    return { include: !shouldIgnoreSpecFile(relativePath), adapterOnly: false };
  },
  parseArtifact(absolutePath, repoRoot) {
    return parseSpecFile(absolutePath, repoRoot);
  },
  inferRelationships({ parsedNodes }): InferenceResult | undefined {
    return inferHierarchyRelationships(parsedNodes);
  },
  validationProfile() {
    return "canonical";
  },
};
