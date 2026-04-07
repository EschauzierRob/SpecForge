import path from "node:path";

import type {
  ComposeRepositoryResult,
  OverlayFile,
} from "../model/types.ts";
import { buildOverlayIndex, composeNodes } from "../overlay/compose.ts";
import { loadOverlayFile } from "../overlay/loader.ts";
import { parseRepository } from "./parse.ts";
import { compareCompositionDiagnostics } from "./shared.ts";

export async function composeRepository(repoPath: string): Promise<ComposeRepositoryResult> {
  const parseResult = await parseRepository(repoPath);

  const overlayLoadResults = await Promise.all(
    parseResult.discovery.discoveredOverlayFiles.map((relativePath) =>
      loadOverlayFile(path.join(parseResult.discovery.repoRoot, relativePath), parseResult.discovery.repoRoot),
    ),
  );
  const overlayFiles = overlayLoadResults
    .map((result) => result.overlayFile)
    .filter((overlayFile): overlayFile is OverlayFile => Boolean(overlayFile))
    .sort((left, right) => left.sourcePath.localeCompare(right.sourcePath));
  const overlayIndexResult = buildOverlayIndex(overlayFiles);
  const composeResult = composeNodes(parseResult.canonicalNodes, overlayIndexResult.index);

  const compositionDiagnostics = overlayLoadResults
    .flatMap((result) => result.diagnostics)
    .concat(overlayIndexResult.diagnostics)
    .concat(composeResult.diagnostics)
    .sort(compareCompositionDiagnostics);

  return {
    discovery: parseResult.discovery,
    canonicalNodes: parseResult.canonicalNodes,
    overlayFiles,
    composedNodes: composeResult.composedNodes,
    diagnostics: parseResult.diagnostics,
    compositionDiagnostics,
  };
}
