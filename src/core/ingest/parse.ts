import path from "node:path";

import type {
  CanonicalNode,
  ParseRepositoryResult,
  RepositoryAdapterOptions,
} from "../model/types.ts";
import { discoverRepository } from "./discovery.ts";
import { attachChildren, compareParserDiagnostics } from "./shared.ts";
import { resolveRepositoryAdapter } from "./adapters/index.ts";

export async function parseRepository(
  repoPath: string,
  options: RepositoryAdapterOptions = {},
): Promise<ParseRepositoryResult> {
  const { adapter } = resolveRepositoryAdapter(options);
  const discovery = await discoverRepository(repoPath, options);
  const parseResults = await Promise.all(
    discovery.discoveredSpecFiles.map((relativePath) =>
      adapter.parseArtifact(path.join(discovery.repoRoot, relativePath), discovery.repoRoot),
    ),
  );

  const parsedNodes = parseResults
    .map((result) => result.node)
    .filter((node): node is CanonicalNode => Boolean(node));
  const parseResultsBySourcePath = new Map(
    discovery.discoveredSpecFiles.map((sourcePath, index) => [sourcePath, parseResults[index]] as const),
  );
  const inference = adapter.inferRelationships({
    discovery,
    parseResultsBySourcePath,
    parsedNodes,
  });
  const repairedMissingParentSpecIds = new Set(
    inference?.relationships
      .filter((relationship) => relationship.state === "inferred" && relationship.selectedParentId)
      .map((relationship) => relationship.childId) ?? [],
  );

  const canonicalNodes = attachChildren(parsedNodes);

  const diagnostics = parseResults
    .flatMap((result) => result.diagnostics)
    .filter((diagnostic) => {
      if (!diagnostic.specId || !repairedMissingParentSpecIds.has(diagnostic.specId)) {
        return true;
      }

      return !(
        diagnostic.code === "missing-parent" ||
        (diagnostic.code === "missing-required-section" && diagnostic.sectionName?.toLowerCase() === "parent")
      );
    })
    .sort(compareParserDiagnostics);

  return {
    discovery,
    canonicalNodes,
    diagnostics,
    ...(inference ? { inference } : {}),
  };
}
