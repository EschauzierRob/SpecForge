import path from "node:path";

import type { CanonicalNode, IngestResult, ParseSpecFileResult } from "../model/types.ts";
import { discoverRepository } from "./discovery.ts";
import { parseSpecFile } from "../parser/map.ts";

function attachChildren(nodes: CanonicalNode[]): CanonicalNode[] {
  const nodesById = new Map(nodes.map((node) => [node.id, node] as const));

  for (const node of nodes) {
    node.childrenIds = [];
  }

  for (const node of nodes) {
    if (!node.parentId) {
      continue;
    }

    const parent = nodesById.get(node.parentId);
    if (!parent) {
      continue;
    }

    parent.childrenIds.push(node.id);
  }

  for (const node of nodes) {
    node.childrenIds.sort((left, right) => left.localeCompare(right));
  }

  return nodes.sort((left, right) => left.sourcePath.localeCompare(right.sourcePath));
}

function compareDiagnostics(left: ParseSpecFileResult["diagnostics"][number], right: ParseSpecFileResult["diagnostics"][number]): number {
  return (
    left.sourcePath.localeCompare(right.sourcePath) ||
    left.code.localeCompare(right.code) ||
    (left.sectionName ?? "").localeCompare(right.sectionName ?? "") ||
    (left.specId ?? "").localeCompare(right.specId ?? "")
  );
}

export async function ingestRepository(repoPath: string): Promise<IngestResult> {
  const discovery = await discoverRepository(repoPath);
  const parseResults = await Promise.all(
    discovery.discoveredSpecFiles.map((relativePath) =>
      parseSpecFile(path.join(discovery.repoRoot, relativePath), discovery.repoRoot),
    ),
  );

  const canonicalNodes = attachChildren(
    parseResults
      .map((result) => result.node)
      .filter((node): node is CanonicalNode => Boolean(node)),
  );

  const diagnostics = parseResults.flatMap((result) => result.diagnostics).sort(compareDiagnostics);

  return {
    discovery,
    canonicalNodes,
    diagnostics,
  };
}
