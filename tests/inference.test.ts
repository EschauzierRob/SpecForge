import test from "node:test";
import assert from "node:assert/strict";

import type { CanonicalNode } from "../src/index.ts";
import { inferHierarchyRelationships } from "../src/core/ingest/inference.ts";

function createNode(overrides: Partial<CanonicalNode>): CanonicalNode {
  return {
    id: "E-0001",
    type: "epic",
    title: "Sample Epic",
    summary: "Sample summary.",
    sourcePath: "specs/epic-0001-sample/epic.md",
    childrenIds: [],
    ...overrides,
  };
}

test("inferHierarchyRelationships selects a parent from an in-content ID reference", () => {
  const feature = createNode({
    id: "F-0001",
    type: "feature",
    title: "Checkout Feature",
    sourcePath: "specs/epic-0001-sample/feature-0001-checkout.md",
    parentId: "E-0001",
  });
  const story = createNode({
    id: "S-0001",
    type: "story",
    title: "Checkout Story",
    sourcePath: "specs/epic-0001-sample/story-0001-checkout.md",
    summary: "This story belongs to F-0001.",
    parentId: undefined,
  });

  const inference = inferHierarchyRelationships([createNode({}), feature, story]);

  assert.equal(story.parentId, "F-0001");
  assert.equal(inference?.relationships[0]?.state, "inferred");
  assert.equal(inference?.relationships[0]?.selectedParentId, "F-0001");
  assert.ok(
    inference?.relationships[0]?.candidates[0]?.evidence.some(
      (evidence) => evidence.strategyId === "content-reference" && evidence.matchedSignal === "id-reference",
    ),
  );
});

test("inferHierarchyRelationships selects the highest-scoring candidate instead of first ID order", () => {
  const weakerFeature = createNode({
    id: "F-0001",
    type: "feature",
    title: "Generic Checkout",
    sourcePath: "specs/epic-0001-sample/feature-0001-generic-checkout.md",
    parentId: "E-0001",
  });
  const strongerFeature = createNode({
    id: "F-0002",
    type: "feature",
    title: "Special Payments",
    sourcePath: "specs/epic-0001-sample/feature-0002-special-payments.md",
    parentId: "E-0001",
  });
  const story = createNode({
    id: "S-0001",
    type: "story",
    title: "Checkout Story",
    sourcePath: "specs/epic-0001-sample/story-0001-checkout.md",
    summary: "The actual parent is F-0002.",
    parentId: undefined,
  });

  const inference = inferHierarchyRelationships([createNode({}), weakerFeature, strongerFeature, story]);

  assert.equal(story.parentId, "F-0002");
  assert.equal(inference?.relationships[0]?.selectedParentId, "F-0002");
});

test("inferHierarchyRelationships selects a parent from combined naming and directory evidence", () => {
  const feature = createNode({
    id: "F-0007",
    type: "feature",
    title: "Billing Work",
    sourcePath: "specs/epic-0001-sample/feature-0007-billing.md",
    parentId: "E-0001",
  });
  const story = createNode({
    id: "S-0007",
    type: "story",
    title: "Billing Story",
    sourcePath: "specs/epic-0001-sample/story-0007-billing-story.md",
    parentId: undefined,
  });

  const inference = inferHierarchyRelationships([createNode({}), feature, story]);

  assert.equal(story.parentId, "F-0007");
  assert.equal(inference?.relationships[0]?.candidates[0]?.state, "selected");
  assert.deepEqual(
    new Set(inference?.relationships[0]?.candidates[0]?.evidence.map((evidence) => evidence.strategyId)),
    new Set(["directory-adjacency", "naming"]),
  );
});

test("inferHierarchyRelationships rejects weak naming-only evidence", () => {
  const feature = createNode({
    id: "F-0001",
    type: "feature",
    title: "Checkout Feature",
    sourcePath: "specs/epic-0001-sample/feature-0001-checkout.md",
    parentId: "E-0001",
  });
  const story = createNode({
    id: "S-9999",
    type: "story",
    title: "Checkout Story",
    sourcePath: "specs/other/story-9999-checkout.md",
    parentId: undefined,
  });

  const inference = inferHierarchyRelationships([createNode({}), feature, story]);

  assert.equal(story.parentId, undefined);
  assert.equal(inference?.relationships[0]?.state, "unresolved");
  assert.equal(inference?.relationships[0]?.candidates[0]?.state, "rejected");
});

test("inferHierarchyRelationships preserves ambiguous equal candidates", () => {
  const featureA = createNode({
    id: "F-0001",
    type: "feature",
    title: "Checkout Alpha",
    sourcePath: "specs/epic-0001-sample/feature-0001-checkout-alpha.md",
    parentId: "E-0001",
  });
  const featureB = createNode({
    id: "F-0002",
    type: "feature",
    title: "Checkout Beta",
    sourcePath: "specs/epic-0001-sample/feature-0002-checkout-beta.md",
    parentId: "E-0001",
  });
  const story = createNode({
    id: "S-0003",
    type: "story",
    title: "Checkout Story",
    sourcePath: "specs/epic-0001-sample/story-0003-checkout.md",
    parentId: undefined,
  });

  const inference = inferHierarchyRelationships([createNode({}), featureA, featureB, story]);

  assert.equal(story.parentId, undefined);
  assert.equal(inference?.relationships[0]?.state, "ambiguous");
  assert.deepEqual(
    inference?.relationships[0]?.candidates.map((candidate) => candidate.state),
    ["ambiguous", "ambiguous"],
  );
});

test("inferHierarchyRelationships replaces an invalid explicit parent only with strong valid evidence", () => {
  const feature = createNode({
    id: "F-0001",
    type: "feature",
    title: "Checkout Feature",
    sourcePath: "specs/epic-0001-sample/feature-0001-checkout.md",
    parentId: "E-0001",
  });
  const story = createNode({
    id: "S-0001",
    type: "story",
    title: "Checkout Story",
    sourcePath: "specs/epic-0001-sample/story-0001-checkout.md",
    summary: "This story belongs to F-0001.",
    parentId: "F-9999",
  });

  const inference = inferHierarchyRelationships([createNode({}), feature, story]);

  assert.equal(story.parentId, "F-0001");
  assert.equal(inference?.relationships[0]?.explicitParentId, "F-9999");
  assert.equal(inference?.relationships[0]?.selectedParentId, "F-0001");
});
