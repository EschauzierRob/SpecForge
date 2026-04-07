import path from "node:path";

import type {
  CanonicalNode,
  ParseRepositoryResult,
} from "../model/types.ts";
import { parseSpecFile } from "../parser/map.ts";
import { discoverRepository } from "./discovery.ts";
import { attachChildren, compareParserDiagnostics } from "./shared.ts";

export async function parseRepository(repoPath: string): Promise<ParseRepositoryResult> {
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

  const diagnostics = parseResults.flatMap((result) => result.diagnostics).sort(compareParserDiagnostics);

  return {
    discovery,
    canonicalNodes,
    diagnostics,
  };
}
