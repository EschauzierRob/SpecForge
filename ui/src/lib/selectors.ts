import type {
  ComposeRepositoryResult,
  ComposedNode,
  PlanningStatus,
  UiWorkspaceState,
  ValidationResult,
} from "./contracts";

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
