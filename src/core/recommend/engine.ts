import { composeRepository } from "../ingest/compose.ts";
import type {
  ComposedNode,
  PlanningStatus,
  RecommendationItem,
  RecommendationResult,
} from "../model/types.ts";

const STATUS_WEIGHT: Record<PlanningStatus | "unplanned", number> = {
  ready: 0,
  in_progress: 1,
  backlog: 2,
  blocked: 3,
  done: 4,
  unplanned: 3,
};

function getStatus(node: ComposedNode): PlanningStatus | "unplanned" {
  return node.overlay?.planningStatus ?? "unplanned";
}

function sortRecommendations(left: RecommendationItem, right: RecommendationItem): number {
  const leftRank = left.rank ?? Number.MAX_SAFE_INTEGER;
  const rightRank = right.rank ?? Number.MAX_SAFE_INTEGER;
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  const statusWeightDiff = STATUS_WEIGHT[left.planningStatus] - STATUS_WEIGHT[right.planningStatus];
  if (statusWeightDiff !== 0) {
    return statusWeightDiff;
  }

  return left.specId.localeCompare(right.specId);
}

export function rankNextWork(nodes: ComposedNode[]): RecommendationResult {
  const completedIds = new Set(
    nodes
      .filter((node) => getStatus(node) === "done")
      .map((node) => node.spec.id),
  );

  const excludedDone: string[] = [];
  const excludedBlocked: string[] = [];
  const excludedByDependencies: string[] = [];

  const recommendations = nodes.flatMap((node): RecommendationItem[] => {
    const status = getStatus(node);

    if (status === "done") {
      excludedDone.push(node.spec.id);
      return [];
    }

    if (node.overlay?.blocked) {
      excludedBlocked.push(node.spec.id);
      return [];
    }

    const unresolvedDependencies = (node.overlay?.dependencies ?? []).filter((dependencyId) => !completedIds.has(dependencyId));

    if (unresolvedDependencies.length > 0) {
      excludedByDependencies.push(node.spec.id);
      return [];
    }

    const rationale: string[] = [];
    if (status === "ready") {
      rationale.push("Ready status prioritized");
    } else {
      rationale.push(`Status: ${status}`);
    }

    if (node.overlay?.rank !== undefined) {
      rationale.push(`Overlay rank ${node.overlay.rank}`);
    } else {
      rationale.push("No rank specified");
    }

    if ((node.overlay?.dependencies ?? []).length === 0) {
      rationale.push("No dependency blockers");
    } else {
      rationale.push("Dependencies satisfied");
    }

    return [
      {
        specId: node.spec.id,
        type: node.spec.type,
        title: node.spec.title,
        summary: node.spec.summary,
        sourcePath: node.spec.sourcePath,
        planningStatus: status,
        rank: node.overlay?.rank,
        rationale,
      },
    ];
  });

  recommendations.sort(sortRecommendations);

  return {
    recommendations,
    excluded: {
      done: excludedDone.sort(),
      blocked: excludedBlocked.sort(),
      unresolvedDependencies: excludedByDependencies.sort(),
    },
  };
}

export async function recommendRepository(repoPath: string): Promise<RecommendationResult> {
  const composeResult = await composeRepository(repoPath);
  return rankNextWork(composeResult.composedNodes);
}
