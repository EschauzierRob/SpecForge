import type {
  ComposeRepositoryResult,
  ComposedNode,
  PlanningStatus,
  UiWorkspaceState,
  ValidationResult,
} from "./contracts";

export interface ComposedTreeNode {
  node: ComposedNode;
  depth: number;
  children: string[];
}

export interface ComposedTreeModel {
  roots: string[];
  byId: Record<string, ComposedTreeNode>;
}

export interface OverviewCounts {
  specCount: number;
  overlayFileCount: number;
  composedNodeCount: number;
  parserDiagnostics: Record<"error" | "warning" | "info", number>;
  compositionDiagnostics: Record<"error" | "warning" | "info", number>;
  validationFindings: Record<"error" | "warning" | "info", number> & { total: number };
}

export function countSeverities(
  entries: Array<{ severity: "error" | "warning" | "info" }>,
): Record<"error" | "warning" | "info", number> {
  return entries.reduce(
    (counts, entry) => {
      counts[entry.severity] += 1;
      return counts;
    },
    { error: 0, warning: 0, info: 0 },
  );
}

export function getOverviewCounts(
  composeResult?: ComposeRepositoryResult,
  validationResult?: ValidationResult,
): OverviewCounts {
  return {
    specCount: composeResult?.canonicalNodes.length ?? 0,
    overlayFileCount: composeResult?.overlayFiles.length ?? 0,
    composedNodeCount: composeResult?.composedNodes.length ?? 0,
    parserDiagnostics: countSeverities(composeResult?.diagnostics ?? []),
    compositionDiagnostics: countSeverities(composeResult?.compositionDiagnostics ?? []),
    validationFindings: {
      total: validationResult?.summary.total ?? 0,
      error: validationResult?.summary.bySeverity.error ?? 0,
      warning: validationResult?.summary.bySeverity.warning ?? 0,
      info: validationResult?.summary.bySeverity.info ?? 0,
    },
  };
}

export function getPlanningStatusCounts(
  composeResult?: ComposeRepositoryResult,
): Record<PlanningStatus | "unplanned", number> {
  const counts: Record<PlanningStatus | "unplanned", number> = {
    backlog: 0,
    ready: 0,
    in_progress: 0,
    blocked: 0,
    done: 0,
    unplanned: 0,
  };

  for (const node of composeResult?.composedNodes ?? []) {
    const status = node.overlay?.planningStatus ?? "unplanned";
    counts[status] += 1;
  }

  return counts;
}

export function getSelectedComposedNode(
  composeResult: ComposeRepositoryResult | undefined,
  selectedItemId: string | undefined,
): ComposedNode | undefined {
  if (!composeResult || !selectedItemId) {
    return undefined;
  }

  return composeResult.composedNodes.find((node) => node.spec.id === selectedItemId);
}

export function getSelectedTitle(state: UiWorkspaceState): string {
  return getSelectedComposedNode(state.composeResult, state.selectedItemId)?.spec.title ?? "No item selected";
}

export function getComposedTreeModel(composeResult?: ComposeRepositoryResult): ComposedTreeModel {
  const emptyModel: ComposedTreeModel = { roots: [], byId: {} };
  if (!composeResult) {
    return emptyModel;
  }

  const byId = Object.fromEntries(composeResult.composedNodes.map((node) => [node.spec.id, node]));
  const childIdsByParent: Record<string, Set<string>> = {};

  for (const node of composeResult.composedNodes) {
    for (const childId of node.spec.childrenIds) {
      if (byId[childId]) {
        if (!childIdsByParent[node.spec.id]) {
          childIdsByParent[node.spec.id] = new Set();
        }
        childIdsByParent[node.spec.id].add(childId);
      }
    }

    if (node.spec.parentId && byId[node.spec.parentId]) {
      if (!childIdsByParent[node.spec.parentId]) {
        childIdsByParent[node.spec.parentId] = new Set();
      }
      childIdsByParent[node.spec.parentId].add(node.spec.id);
    }
  }

  const roots = composeResult.composedNodes
    .filter((node) => !node.spec.parentId || !byId[node.spec.parentId])
    .map((node) => node.spec.id)
    .sort((left, right) => left.localeCompare(right));

  const result: ComposedTreeModel = { roots, byId: {} };
  const visited = new Set<string>();

  function visit(nodeId: string, depth: number): void {
    if (!byId[nodeId] || visited.has(nodeId)) {
      return;
    }

    visited.add(nodeId);
    const node = byId[nodeId];
    const children = Array.from(childIdsByParent[nodeId] ?? []).sort((left, right) => left.localeCompare(right));
    result.byId[nodeId] = { node, depth, children };

    for (const childId of children) {
      visit(childId, depth + 1);
    }
  }

  for (const rootId of roots) {
    visit(rootId, 0);
  }

  for (const node of composeResult.composedNodes) {
    if (!visited.has(node.spec.id)) {
      result.roots.push(node.spec.id);
      visit(node.spec.id, 0);
    }
  }

  return result;
}
