import type {
  CanonicalNode,
  CompositionDiagnostic,
  ParseSpecFileResult,
  ParserDiagnostic,
} from "../model/types.ts";

export function attachChildren(nodes: CanonicalNode[]): CanonicalNode[] {
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

export function compareParserDiagnostics(
  left: ParseSpecFileResult["diagnostics"][number] | ParserDiagnostic,
  right: ParseSpecFileResult["diagnostics"][number] | ParserDiagnostic,
): number {
  return (
    left.sourcePath.localeCompare(right.sourcePath) ||
    left.code.localeCompare(right.code) ||
    (left.sectionName ?? "").localeCompare(right.sectionName ?? "") ||
    (left.specId ?? "").localeCompare(right.specId ?? "")
  );
}

export function compareCompositionDiagnostics(left: CompositionDiagnostic, right: CompositionDiagnostic): number {
  return (
    left.sourcePath.localeCompare(right.sourcePath) ||
    left.code.localeCompare(right.code) ||
    (left.sectionName ?? "").localeCompare(right.sectionName ?? "") ||
    (left.specId ?? "").localeCompare(right.specId ?? "")
  );
}
