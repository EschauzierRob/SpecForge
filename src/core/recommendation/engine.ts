import type {
  ComposedNode,
  RecommendationEvaluation,
  RecommendationItem,
  RecommendationReasonCode,
  RecommendationResult,
  SpecNodeType,
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

const recommendationWorkUnitPriority: Record<SpecNodeType, number> = {
  story: 0,
  feature: 1,
  task: 2,
  epic: 3,
};

interface DependencyEvaluation {
  dependencies: string[];
  ignoredAncestorDependencies: string[];
}

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

function getNodeStatus(node: ComposedNode): string {
  return node.overlay?.planningStatus ?? "unspecified";
}

function getNodeRank(node: ComposedNode): number {
  return node.overlay?.rank ?? DEFAULT_RANK;
}

function buildAncestorPath(node: ComposedNode, nodeIndex: Map<string, ComposedNode>): ComposedNode[] {
  const path: ComposedNode[] = [];
  const visited = new Set<string>();
  let current: ComposedNode | undefined = node;

  while (current && !visited.has(current.spec.id)) {
    path.unshift(current);
    visited.add(current.spec.id);
    current = current.spec.parentId ? nodeIndex.get(current.spec.parentId) : undefined;
  }

  return path;
}

function collectUnfinishedDescendantIds(node: ComposedNode, nodeIndex: Map<string, ComposedNode>): string[] {
  const descendantIds: string[] = [];
  const stack = [...node.spec.childrenIds].reverse();
  const visited = new Set<string>();

  while (stack.length > 0) {
    const descendantId = stack.pop();
    if (!descendantId || visited.has(descendantId)) {
      continue;
    }

    visited.add(descendantId);
    const descendant = nodeIndex.get(descendantId);
    if (!descendant) {
      continue;
    }

    if (descendant.overlay?.planningStatus !== "done") {
      descendantIds.push(descendantId);
    }

    for (const childId of [...descendant.spec.childrenIds].reverse()) {
      stack.push(childId);
    }
  }

  return descendantIds;
}

function hasUnfinishedStoryAncestor(node: ComposedNode, path: ComposedNode[]): boolean {
  return path
    .slice(0, -1)
    .some((ancestor) => ancestor.spec.type === "story" && ancestor.overlay?.planningStatus !== "done");
}

function collectPathDependencies(path: ComposedNode[]): DependencyEvaluation {
  const dependencies: string[] = [];
  const ignoredAncestorDependencies: string[] = [];

  for (let index = 0; index < path.length; index += 1) {
    const node = path[index];
    const ancestorIds = new Set(path.slice(0, index).map((ancestor) => ancestor.spec.id));

    for (const dependencyId of normalizeDependencies(node)) {
      if (ancestorIds.has(dependencyId)) {
        ignoredAncestorDependencies.push(dependencyId);
        continue;
      }

      dependencies.push(dependencyId);
    }
  }

  return {
    dependencies: uniqueSorted(dependencies),
    ignoredAncestorDependencies: uniqueSorted(ignoredAncestorDependencies),
  };
}

function isContainerWithUnfinishedDescendants(node: ComposedNode, unfinishedDescendantIds: string[]): boolean {
  if (node.spec.type !== "epic" && node.spec.type !== "feature") {
    return false;
  }

  return unfinishedDescendantIds.length > 0;
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
  const planningStatus = getNodeStatus(node) as RecommendationEvaluation["planningStatus"];
  const rankValue = getNodeRank(node);
  const priorityPathNodes = buildAncestorPath(node, nodeIndex);
  const priorityPath = priorityPathNodes.map((pathNode) => pathNode.spec.id);
  const { dependencies, ignoredAncestorDependencies } = collectPathDependencies(priorityPathNodes);
  const unfinishedDescendantIds = collectUnfinishedDescendantIds(node, nodeIndex);

  const unresolvedDependencies = dependencies.filter((dependencyId) => {
    const dependencyNode = nodeIndex.get(dependencyId);
    if (!dependencyNode) {
      return true;
    }

    return !doneIndex.has(dependencyId);
  });

  const hasMissingDependencyNode = dependencies.some((dependencyId) => !nodeIndex.has(dependencyId));
  const hasUnfinishedDescendants = isContainerWithUnfinishedDescendants(node, unfinishedDescendantIds);
  const isTaskUnderUnfinishedStory = node.spec.type === "task" && hasUnfinishedStoryAncestor(node, priorityPathNodes);

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

  if (hasUnfinishedDescendants) {
    reasonCodes.push("excluded_container_with_unfinished_descendants");
  }

  if (isTaskUnderUnfinishedStory) {
    reasonCodes.push("excluded_task_under_unfinished_story");
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

  if (node.spec.type === "story") {
    reasonCodes.push("included_story_work_unit");
    topScoreFactors.push("story work unit");
  } else if (!hasUnfinishedDescendants && !isTaskUnderUnfinishedStory) {
    reasonCodes.push("included_fallback_work_unit");
    topScoreFactors.push(`${node.spec.type} fallback work unit`);
  }

  if (priorityPath.length > 1) {
    reasonCodes.push("included_priority_path");
    topScoreFactors.push(`priority path ${priorityPath.join(" > ")}`);
  }

  if (ignoredAncestorDependencies.length > 0) {
    reasonCodes.push("included_ancestor_dependency_ignored");
    topScoreFactors.push(`ignored hierarchy dependencies ${ignoredAncestorDependencies.join(", ")}`);
  }

  const eligible = !reasonCodes.some((reasonCode) => reasonCode.startsWith("excluded_"));
  const summary = eligible
    ? `Included ${node.spec.id} as a ${node.spec.type} work unit based on status (${planningStatus}), rank (${rankValue}), and priority path (${priorityPath.join(" > ")}).`
    : `Excluded ${node.spec.id} due to ${reasonCodes.filter((reasonCode) => reasonCode.startsWith("excluded_")).join(", ")}.`;

  return {
    specId: node.spec.id,
    specTitle: node.spec.title,
    specType: node.spec.type,
    eligible,
    score: planningPriority[planningStatus] * 1_000_000 + rankValue,
    rankValue,
    planningStatus,
    unresolvedDependencies,
    priorityPath,
    ignoredAncestorDependencies,
    unfinishedDescendantIds,
    rationale: {
      reasonCodes: uniqueSorted(reasonCodes),
      summary,
      topScoreFactors: uniqueSorted(topScoreFactors),
    },
  };
}

function comparePathNodes(leftNode: ComposedNode | undefined, rightNode: ComposedNode | undefined): number {
  if (!leftNode || !rightNode) {
    return 0;
  }

  return (
    planningPriority[getNodeStatus(leftNode)] - planningPriority[getNodeStatus(rightNode)] ||
    getNodeRank(leftNode) - getNodeRank(rightNode) ||
    leftNode.spec.id.localeCompare(rightNode.spec.id)
  );
}

function compareRecommendations(
  left: RecommendationItem,
  right: RecommendationItem,
  nodeIndex: Map<string, ComposedNode>,
): number {
  const shortestPathLength = Math.min(left.priorityPath.length, right.priorityPath.length);

  for (let index = 0; index < shortestPathLength; index += 1) {
    const leftPathId = left.priorityPath[index];
    const rightPathId = right.priorityPath[index];
    if (leftPathId === rightPathId) {
      continue;
    }

    const pathComparison = comparePathNodes(nodeIndex.get(leftPathId), nodeIndex.get(rightPathId));
    if (pathComparison !== 0) {
      return pathComparison;
    }
  }

  return (
    recommendationWorkUnitPriority[left.specType] - recommendationWorkUnitPriority[right.specType] ||
    left.priorityPath.length - right.priorityPath.length ||
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
    .sort((left, right) => compareRecommendations(left, right, nodeIndex));

  return {
    recommendations,
    evaluations,
  };
}
