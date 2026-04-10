import type {
  ComposedNode,
  RecommendationEvaluation,
  RecommendationItem,
  RecommendationReasonCode,
  RecommendationResult,
  ValidationFinding,
} from "../model/types.ts";

const DEFAULT_RANK = Number.MAX_SAFE_INTEGER;

const planningPriority: Record<string, number> = {
  ready: 0,
  backlog: 1,
  in_progress: 2,
  blocked: 3,
  done: 4,
  unspecified: 5,
};

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function normalizeDependencies(node: ComposedNode): string[] {
  const overlayDependencies = node.overlay?.dependencies ?? [];
  if (overlayDependencies.length > 0) {
    return uniqueSorted(overlayDependencies);
  }

  return uniqueSorted(node.spec.dependencies ?? []);
}

function buildValidationDependencyWarningIndex(findings: ValidationFinding[]): Set<string> {
  const index = new Set<string>();

  for (const finding of findings) {
    if (finding.ruleId !== "V-104" || !finding.specId) {
      continue;
    }

    index.add(finding.specId);
  }

  return index;
}

function buildEvaluation(
  node: ComposedNode,
  doneIndex: Set<string>,
  nodeIndex: Map<string, ComposedNode>,
  hasValidationDependencyWarning: boolean,
): RecommendationEvaluation {
  const reasonCodes: RecommendationReasonCode[] = [];
  const topScoreFactors: string[] = [];
  const planningStatus = node.overlay?.planningStatus ?? "unspecified";
  const rankValue = node.overlay?.rank ?? DEFAULT_RANK;
  const dependencies = normalizeDependencies(node);

  const unresolvedDependencies = dependencies.filter((dependencyId) => {
    const dependencyNode = nodeIndex.get(dependencyId);
    if (!dependencyNode) {
      return true;
    }

    return !doneIndex.has(dependencyId);
  });

  const hasMissingDependencyNode = dependencies.some((dependencyId) => !nodeIndex.has(dependencyId));

  if (planningStatus === "done") {
    reasonCodes.push("excluded_planning_status_done");
  }

  if (node.overlay?.blocked === true) {
    reasonCodes.push("excluded_blocked");
  }

  if (unresolvedDependencies.length > 0) {
    reasonCodes.push("excluded_unresolved_dependencies");
  }

  if (hasMissingDependencyNode) {
    reasonCodes.push("excluded_missing_dependency_node");
  }

  if (hasValidationDependencyWarning) {
    reasonCodes.push("excluded_validation_dependency_warning");
  }

  if (planningStatus === "ready") {
    reasonCodes.push("included_ready_status");
    topScoreFactors.push("ready status");
  }

  if (dependencies.length === 0) {
    reasonCodes.push("included_no_dependencies");
    topScoreFactors.push("no dependencies");
  } else if (unresolvedDependencies.length === 0) {
    reasonCodes.push("included_all_dependencies_resolved");
    topScoreFactors.push("dependencies resolved");
  }

  if (node.overlay?.rank === undefined) {
    reasonCodes.push("included_default_rank");
    topScoreFactors.push("default rank fallback");
  } else {
    reasonCodes.push("included_rank_present");
    topScoreFactors.push(`rank=${node.overlay.rank}`);
  }

  const eligible = !reasonCodes.some((reasonCode) => reasonCode.startsWith("excluded_"));
  const summary = eligible
    ? `Included ${node.spec.id} based on status (${planningStatus}) and rank (${rankValue}).`
    : `Excluded ${node.spec.id} due to ${reasonCodes.filter((reasonCode) => reasonCode.startsWith("excluded_")).join(", ")}.`;

  return {
    specId: node.spec.id,
    eligible,
    score: planningPriority[planningStatus] * 1_000_000 + rankValue,
    rankValue,
    planningStatus,
    unresolvedDependencies,
    rationale: {
      reasonCodes: uniqueSorted(reasonCodes),
      summary,
      topScoreFactors: uniqueSorted(topScoreFactors),
    },
  };
}

function compareRecommendations(left: RecommendationItem, right: RecommendationItem): number {
  return (
    planningPriority[left.planningStatus] - planningPriority[right.planningStatus] ||
    left.rankValue - right.rankValue ||
    left.specId.localeCompare(right.specId)
  );
}

export function rankRecommendedNextWork(
  composedNodes: ComposedNode[],
  validationFindings: ValidationFinding[] = [],
): RecommendationResult {
  const nodeIndex = new Map(composedNodes.map((node) => [node.spec.id, node]));
  const doneIndex = new Set(
    composedNodes
      .filter((node) => node.overlay?.planningStatus === "done")
      .map((node) => node.spec.id),
  );
  const dependencyWarningIndex = buildValidationDependencyWarningIndex(validationFindings);

  const evaluations = composedNodes
    .map((node) =>
      buildEvaluation(
        node,
        doneIndex,
        nodeIndex,
        dependencyWarningIndex.has(node.spec.id),
      ),
    )
    .sort((left, right) => left.specId.localeCompare(right.specId));

  const recommendations = evaluations
    .filter((evaluation): evaluation is RecommendationItem => evaluation.eligible)
    .sort(compareRecommendations);

  return {
    recommendations,
    evaluations,
  };
}
