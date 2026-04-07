import type {
  CanonicalNode,
  ComposedNode,
  CompositionDiagnostic,
  OverlayFacet,
  OverlayFile,
} from "../model/types.ts";

function createDiagnostic(
  diagnostic: Omit<CompositionDiagnostic, "sourcePath">,
  sourcePath: string,
): CompositionDiagnostic {
  return {
    sourcePath,
    ...diagnostic,
  };
}

export function buildOverlayIndex(
  overlayFiles: OverlayFile[],
): { index: Map<string, OverlayFacet>; diagnostics: CompositionDiagnostic[] } {
  const index = new Map<string, OverlayFacet>();
  const diagnostics: CompositionDiagnostic[] = [];
  const sortedOverlayFiles = [...overlayFiles].sort((left, right) => left.sourcePath.localeCompare(right.sourcePath));

  for (const overlayFile of sortedOverlayFiles) {
    for (const entry of overlayFile.entries) {
      if (index.has(entry.specId)) {
        diagnostics.push(
          createDiagnostic(
            {
              severity: "warning",
              code: "duplicate-overlay-entry",
              message: `Duplicate overlay entry for ${entry.specId} ignored because an earlier overlay file already claimed it.`,
              specId: entry.specId,
            },
            overlayFile.sourcePath,
          ),
        );
        continue;
      }

      index.set(entry.specId, {
        ...entry,
        sourcePath: overlayFile.sourcePath,
        repositoryId: overlayFile.repositoryId,
      });
    }
  }

  return { index, diagnostics };
}

export function composeNodes(
  canonicalNodes: CanonicalNode[],
  overlayIndex: Map<string, OverlayFacet>,
): { composedNodes: ComposedNode[]; diagnostics: CompositionDiagnostic[] } {
  const diagnostics: CompositionDiagnostic[] = [];
  const canonicalIds = new Set(canonicalNodes.map((node) => node.id));
  const composedNodes = canonicalNodes.map((spec) => ({
    spec,
    overlay: overlayIndex.get(spec.id),
  }));

  for (const [specId, overlay] of overlayIndex.entries()) {
    if (canonicalIds.has(specId)) {
      continue;
    }

    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "unknown-overlay-specid",
          message: `Overlay entry references unknown specId ${specId}.`,
          specId,
        },
        overlay.sourcePath,
      ),
    );
  }

  return { composedNodes, diagnostics };
}
