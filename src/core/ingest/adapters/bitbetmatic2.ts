import path from "node:path";

import type { InferenceResult } from "../../model/types.ts";
import { inferAdapterProjectionVirtualNodes } from "../projection.ts";
import { canonicalRepositoryAdapter } from "./canonical.ts";
import type { RepositoryAdapter } from "./types.ts";

const markdownLikeExtensions = new Set([".md", ".mdx", ".markdown", ".mdown", ".mkd", ".mkdn"]);

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}

function isExtensionless(fileName: string): boolean {
  return !fileName.includes(".");
}

export const bitbetmatic2RepositoryAdapter: RepositoryAdapter = {
  profile: "bitbetmatic2",
  discoverCandidates(relativePath) {
    const canonicalAcceptance = canonicalRepositoryAdapter.discoverCandidates(relativePath);
    if (canonicalAcceptance.include) {
      return canonicalAcceptance;
    }

    const normalizedPath = normalizePath(relativePath);
    if (normalizedPath.startsWith("specs/templates/")) {
      return { include: false, adapterOnly: false };
    }

    const fileName = path.basename(normalizedPath);
    const extension = path.extname(fileName).toLowerCase();
    if (markdownLikeExtensions.has(extension) || isExtensionless(fileName)) {
      return { include: true, adapterOnly: true };
    }

    return { include: false, adapterOnly: false };
  },
  parseArtifact(absolutePath, repoRoot) {
    return canonicalRepositoryAdapter.parseArtifact(absolutePath, repoRoot);
  },
  inferRelationships({ discovery, parseResultsBySourcePath, parsedNodes }): InferenceResult | undefined {
    const inferredRelationships = canonicalRepositoryAdapter.inferRelationships({
      discovery,
      parseResultsBySourcePath,
      parsedNodes,
    });
    const projectedVirtualNodes = inferAdapterProjectionVirtualNodes(discovery, parseResultsBySourcePath, parsedNodes);

    const relationships = [
      ...(inferredRelationships?.relationships ?? []),
      ...projectedVirtualNodes.relationships,
    ].sort((left, right) => left.childId.localeCompare(right.childId));

    if (relationships.length === 0 && projectedVirtualNodes.virtualNodes.length === 0) {
      return undefined;
    }

    return {
      relationships,
      ...(projectedVirtualNodes.virtualNodes.length > 0 ? { virtualNodes: projectedVirtualNodes.virtualNodes } : {}),
    };
  },
  validationProfile() {
    return "bitbetmatic2";
  },
};
