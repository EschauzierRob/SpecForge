import type {
  ComposeRepositoryResult,
  ComposedNode,
  DiagnosticSeverity,
  PlanningStatus,
  UiWorkspaceState,
  ValidationFinding,
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

export const PLANNING_STATUS_LANE_ORDER: Array<PlanningStatus | "unplanned"> = [
  "unplanned",
  "backlog",
  "ready",
  "in_progress",
  "done",
];

export interface BoardLane {
  status: PlanningStatus | "unplanned";
  nodes: ComposedNode[];
  count: number;
}

export interface BoardFilters {
  blockedOnly: boolean;
  hasDependencies: boolean;
}

export interface TriageBadge {
  kind: "blocked" | "dependencies";
  label: string;
  title?: string;
}

export interface WarningsFilters {
  severity: Record<DiagnosticSeverity, boolean>;
  ruleIdQuery: string;
}

export type WarningsEmptyState = "no-findings" | "no-matches";

export const DEFAULT_WARNINGS_FILTERS: Readonly<WarningsFilters> = Object.freeze({
  severity: {
    error: true,
    warning: true,
    info: true,
  },
  ruleIdQuery: "",
});

export function createWarningsFilters(): WarningsFilters {
  return {
    severity: {
      ...DEFAULT_WARNINGS_FILTERS.severity,
    },
    ruleIdQuery: DEFAULT_WARNINGS_FILTERS.ruleIdQuery,
  };
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

  function toLaneStatus(status: PlanningStatus | undefined): PlanningStatus | "unplanned" {
    if (!status) {
      return "unplanned";
    }

    return status === "blocked" ? "in_progress" : status;
  }

  for (const node of composeResult?.composedNodes ?? []) {
    const status = toLaneStatus(node.overlay?.planningStatus);
    counts[status] += 1;
  }

  return counts;
}

export function getBoardLanes(composeResult?: ComposeRepositoryResult): BoardLane[] {
  const counts = getPlanningStatusCounts(composeResult);
  const nodesByStatus: Record<PlanningStatus | "unplanned", ComposedNode[]> = {
    backlog: [],
    ready: [],
    in_progress: [],
    blocked: [],
    done: [],
    unplanned: [],
  };

  function toLaneStatus(status: PlanningStatus | undefined): PlanningStatus | "unplanned" {
    if (!status) {
      return "unplanned";
    }

    return status === "blocked" ? "in_progress" : status;
  }

  for (const node of composeResult?.composedNodes ?? []) {
    const status = toLaneStatus(node.overlay?.planningStatus);
    nodesByStatus[status].push(node);
  }

  return PLANNING_STATUS_LANE_ORDER.map((status) => ({
    status,
    nodes: nodesByStatus[status].sort((left, right) => left.spec.id.localeCompare(right.spec.id)),
    count: counts[status],
  }));
}

export function filterBoardNodes(nodes: ComposedNode[], filters: BoardFilters): ComposedNode[] {
  return nodes.filter((node) => {
    if (filters.blockedOnly && !node.overlay?.blocked) {
      return false;
    }

    if (filters.hasDependencies && getDependencyCount(node) === 0) {
      return false;
    }

    return true;
  });
}

export function getDependencyCount(node: ComposedNode): number {
  return node.overlay?.dependencies?.length ?? 0;
}

export function getTriageBadges(node: ComposedNode): TriageBadge[] {
  const badges: TriageBadge[] = [];
  const dependencyCount = getDependencyCount(node);

  if (node.overlay?.blocked) {
    badges.push({
      kind: "blocked",
      label: "Blocked",
      title: getBlockedReason(node),
    });
  }

  if (dependencyCount > 0) {
    badges.push({
      kind: "dependencies",
      label: `Deps: ${dependencyCount}`,
      title: `${dependencyCount} dependency reference${dependencyCount === 1 ? "" : "s"}`,
    });
  }

  return badges;
}

export function getBlockedReason(node: ComposedNode): string {
  const blockedReason = node.overlay?.blockedReason?.trim();
  if (blockedReason) {
    return blockedReason;
  }

  const notes = node.overlay?.notes?.trim();
  if (notes) {
    return notes;
  }

  return "No blocker reason provided.";
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

export function getSelectedLineageToEpic(
  composeResult: ComposeRepositoryResult | undefined,
  selectedItemId: string | undefined,
): ComposedNode[] {
  if (!composeResult || !selectedItemId) {
    return [];
  }

  const byId: Record<string, ComposedNode | undefined> = Object.fromEntries(
    composeResult.composedNodes.map((node) => [node.spec.id, node]),
  );
  const lineage: ComposedNode[] = [];
  const visited = new Set<string>();
  let currentNode = byId[selectedItemId];

  while (currentNode && !visited.has(currentNode.spec.id)) {
    lineage.push(currentNode);
    visited.add(currentNode.spec.id);

    const parentId = currentNode.spec.parentId;
    currentNode = parentId ? byId[parentId] : undefined;
  }

  return lineage.reverse();
}

export function getSelectedTitle(state: UiWorkspaceState): string {
  return getSelectedComposedNode(state.composeResult, state.selectedItemId)?.spec.title ?? "No item selected";
}

export function getFindingRuleIds(validationResult?: ValidationResult): string[] {
  if (!validationResult) {
    return [];
  }

  return Object.keys(validationResult.summary.byRuleId).sort((left, right) => left.localeCompare(right));
}

export function filterValidationFindings(
  findings: ValidationFinding[],
  filters: WarningsFilters,
): ValidationFinding[] {
  const normalizedRuleFilter = filters.ruleIdQuery.trim().toLowerCase();
  const severityFilteredFindings = findings.filter((finding) => filters.severity[finding.severity]);

  if (normalizedRuleFilter.length === 0) {
    return severityFilteredFindings;
  }

  return severityFilteredFindings.filter((finding) => finding.ruleId.toLowerCase().includes(normalizedRuleFilter));
}

export function getWarningsEmptyState(
  totalFindings: number,
  filteredFindings: number,
): WarningsEmptyState | undefined {
  if (totalFindings === 0) {
    return "no-findings";
  }

  if (filteredFindings === 0) {
    return "no-matches";
  }

  return undefined;
}

export function groupFindingsBySeverity(findings: ValidationFinding[]): Record<DiagnosticSeverity, ValidationFinding[]> {
  const groups: Record<DiagnosticSeverity, ValidationFinding[]> = {
    error: [],
    warning: [],
    info: [],
  };

  for (const finding of findings) {
    groups[finding.severity].push(finding);
  }

  return groups;
}

export function getFindingNavigationSpecId(
  finding: ValidationFinding,
  composeResult?: ComposeRepositoryResult,
): string | undefined {
  if (!finding.specId) {
    return undefined;
  }

  if (!composeResult) {
    return finding.specId;
  }

  return composeResult.composedNodes.some((node) => node.spec.id === finding.specId) ? finding.specId : undefined;
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
