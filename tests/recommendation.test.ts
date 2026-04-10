import test from "node:test";
import assert from "node:assert/strict";

import type { ComposedNode, SpecNodeType, ValidationFinding } from "../src/index.ts";
import { rankRecommendedNextWork } from "../src/index.ts";

function createComposedNode(overrides: Partial<ComposedNode> = {}): ComposedNode {
  return {
    spec: {
      id: "T-0001",
      type: "task",
      title: "Task",
      summary: "Task summary",
      sourcePath: "specs/epic-0001-sample/task-0001-task.md",
      parentId: "S-0001",
      childrenIds: [],
      dependencies: [],
    },
    overlay: {
      specId: "T-0001",
      sourcePath: "specforge/overlay/local-dev.overlay.json",
      repositoryId: "local",
      planningStatus: "ready",
      rank: 1,
      blocked: false,
      dependencies: [],
    },
    ...overrides,
  };
}

function createHierarchyNode(
  id: string,
  type: SpecNodeType,
  options: {
    parentId?: string;
    childrenIds?: string[];
    planningStatus?: "backlog" | "ready" | "in_progress" | "blocked" | "done";
    rank?: number;
    dependencies?: string[];
    blocked?: boolean;
  } = {},
): ComposedNode {
  return {
    spec: {
      id,
      type,
      title: id,
      summary: `${id} summary`,
      sourcePath: `specs/${id}.md`,
      parentId: options.parentId,
      childrenIds: options.childrenIds ?? [],
      dependencies: [],
    },
    overlay: {
      specId: id,
      sourcePath: "specforge/overlay/local-dev.overlay.json",
      repositoryId: "local",
      planningStatus: options.planningStatus ?? "backlog",
      rank: options.rank,
      blocked: options.blocked ?? false,
      dependencies: options.dependencies ?? [],
    },
  };
}

test("rankRecommendedNextWork returns deterministic output", () => {
  const first = createComposedNode();
  const second = createComposedNode({
    spec: {
      ...createComposedNode().spec,
      id: "T-0002",
      sourcePath: "specs/epic-0001-sample/task-0002-task.md",
    },
    overlay: {
      ...createComposedNode().overlay,
      specId: "T-0002",
      rank: 2,
    },
  });

  const runA = rankRecommendedNextWork([second, first]);
  const runB = rankRecommendedNextWork([first, second]);

  assert.deepEqual(runA.recommendations, runB.recommendations);
  assert.deepEqual(
    runA.recommendations.map((item) => item.specId),
    ["T-0001", "T-0002"],
  );
  assert.deepEqual(
    runA.recommendations.map((item) => item.specTitle),
    ["Task", "Task"],
  );
});

test("rankRecommendedNextWork applies exclusion rules", () => {
  const doneNode = createComposedNode({
    spec: {
      ...createComposedNode().spec,
      id: "T-0002",
      sourcePath: "specs/epic-0001-sample/task-0002-task.md",
    },
    overlay: {
      ...createComposedNode().overlay,
      specId: "T-0002",
      planningStatus: "done",
    },
  });

  const blockedNode = createComposedNode({
    spec: {
      ...createComposedNode().spec,
      id: "T-0003",
      sourcePath: "specs/epic-0001-sample/task-0003-task.md",
    },
    overlay: {
      ...createComposedNode().overlay,
      specId: "T-0003",
      blocked: true,
    },
  });

  const dependencyNode = createComposedNode({
    spec: {
      ...createComposedNode().spec,
      id: "T-0004",
      sourcePath: "specs/epic-0001-sample/task-0004-task.md",
    },
    overlay: {
      ...createComposedNode().overlay,
      specId: "T-0004",
      dependencies: ["T-0003"],
    },
  });

  const result = rankRecommendedNextWork([createComposedNode(), doneNode, blockedNode, dependencyNode]);

  assert.deepEqual(result.recommendations.map((item) => item.specId), ["T-0001"]);

  const doneEvaluation = result.evaluations.find((item) => item.specId === "T-0002");
  assert.ok(doneEvaluation?.rationale.reasonCodes.includes("excluded_planning_status_done"));

  const blockedEvaluation = result.evaluations.find((item) => item.specId === "T-0003");
  assert.ok(blockedEvaluation?.rationale.reasonCodes.includes("excluded_blocked"));

  const dependencyEvaluation = result.evaluations.find((item) => item.specId === "T-0004");
  assert.ok(dependencyEvaluation?.rationale.reasonCodes.includes("excluded_unresolved_dependencies"));
});

test("rankRecommendedNextWork recommends story work units before parent containers and child tasks", () => {
  const epic = createHierarchyNode("E-1000", "epic", {
    childrenIds: ["F-1000"],
    rank: 1,
  });
  const feature = createHierarchyNode("F-1000", "feature", {
    parentId: "E-1000",
    childrenIds: ["S-1000"],
  });
  const story = createHierarchyNode("S-1000", "story", {
    parentId: "F-1000",
    childrenIds: ["T-1000"],
  });
  const task = createHierarchyNode("T-1000", "task", {
    parentId: "S-1000",
  });

  const result = rankRecommendedNextWork([task, story, feature, epic]);

  assert.deepEqual(result.recommendations.map((item) => item.specId), ["S-1000"]);
  assert.deepEqual(result.recommendations[0]?.priorityPath, ["E-1000", "F-1000", "S-1000"]);
  assert.ok(result.recommendations[0]?.rationale.reasonCodes.includes("included_story_work_unit"));

  const epicEvaluation = result.evaluations.find((item) => item.specId === "E-1000");
  assert.ok(epicEvaluation?.rationale.reasonCodes.includes("excluded_container_with_unfinished_descendants"));

  const taskEvaluation = result.evaluations.find((item) => item.specId === "T-1000");
  assert.ok(taskEvaluation?.rationale.reasonCodes.includes("excluded_task_under_unfinished_story"));
});

test("rankRecommendedNextWork ignores hierarchy dependencies and inherits ancestor blockers", () => {
  const epic = createHierarchyNode("E-2000", "epic", {
    childrenIds: ["F-2000", "F-2001"],
  });
  const firstFeature = createHierarchyNode("F-2000", "feature", {
    parentId: "E-2000",
    childrenIds: ["S-2000"],
  });
  const firstStory = createHierarchyNode("S-2000", "story", {
    parentId: "F-2000",
    dependencies: ["F-2000"],
  });
  const secondFeature = createHierarchyNode("F-2001", "feature", {
    parentId: "E-2000",
    childrenIds: ["S-2001"],
    dependencies: ["F-2000"],
  });
  const secondStory = createHierarchyNode("S-2001", "story", {
    parentId: "F-2001",
  });

  const result = rankRecommendedNextWork([epic, firstFeature, firstStory, secondFeature, secondStory]);

  assert.deepEqual(result.recommendations.map((item) => item.specId), ["S-2000"]);
  assert.deepEqual(result.recommendations[0]?.ignoredAncestorDependencies, ["F-2000"]);
  assert.ok(result.recommendations[0]?.rationale.reasonCodes.includes("included_ancestor_dependency_ignored"));

  const blockedByAncestor = result.evaluations.find((item) => item.specId === "S-2001");
  assert.deepEqual(blockedByAncestor?.unresolvedDependencies, ["F-2000"]);
  assert.ok(blockedByAncestor?.rationale.reasonCodes.includes("excluded_unresolved_dependencies"));
});

test("rankRecommendedNextWork handles missing optional overlay fields", () => {
  const missingOverlayFields = createComposedNode({
    spec: {
      ...createComposedNode().spec,
      id: "T-0005",
      sourcePath: "specs/epic-0001-sample/task-0005-task.md",
    },
    overlay: {
      specId: "T-0005",
      sourcePath: "specforge/overlay/local-dev.overlay.json",
      repositoryId: "local",
    },
  });

  const result = rankRecommendedNextWork([missingOverlayFields]);

  assert.equal(result.recommendations.length, 1);
  assert.equal(result.recommendations[0]?.specId, "T-0005");
  assert.ok(result.recommendations[0]?.rationale.reasonCodes.includes("included_default_rank"));
});

test("rankRecommendedNextWork adds rationale to each recommended item", () => {
  const findings: ValidationFinding[] = [
    {
      ruleId: "V-104",
      severity: "warning",
      message: "Dependency missing",
      sourcePaths: ["specforge/overlay/local-dev.overlay.json"],
      specId: "T-0002",
    },
  ];

  const first = createComposedNode({
    spec: {
      ...createComposedNode().spec,
      id: "T-0002",
      sourcePath: "specs/epic-0001-sample/task-0002-task.md",
    },
    overlay: {
      ...createComposedNode().overlay,
      specId: "T-0002",
      dependencies: ["UNKNOWN-1"],
    },
  });

  const second = createComposedNode();

  const result = rankRecommendedNextWork([first, second], findings);

  for (const item of result.recommendations) {
    assert.ok(item.rationale.summary.length > 0);
    assert.ok(item.rationale.reasonCodes.length > 0);
    assert.ok(item.rationale.topScoreFactors.length > 0);
  }

  const excluded = result.evaluations.find((item) => item.specId === "T-0002");
  assert.ok(excluded?.rationale.reasonCodes.includes("excluded_validation_dependency_warning"));
});
