import test from "node:test";
import assert from "node:assert/strict";

import type { ComposedNode, ValidationFinding } from "../src/index.ts";
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
      dependencies: ["T-0002"],
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
