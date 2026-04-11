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

test("inferHierarchyRelationships adds grammar-derived evidence with matched groups", () => {
  const epic = createNode({
    id: "E-0004",
    type: "epic",
    title: "Epic 0004",
    sourcePath: "specs/epic-0004-payments/epic.md",
  });
  const feature = createNode({
    id: "F-0003",
    type: "feature",
    title: "Feature 3",
    sourcePath: "specs/epic-0004-payments/feature-3.md",
    parentId: "E-0004",
  });
  const story = createNode({
    id: "S-0301",
    type: "story",
    title: "Story 3.1",
    sourcePath: "specs/epic-0004-payments/feature-3",
    summary: "Depends on Feature 3 and aligns with Epic 0004.",
    parentId: undefined,
  });

  const inference = inferHierarchyRelationships([epic, feature, story]);
  const selected = inference?.relationships[0]?.candidates.find((candidate) => candidate.state === "selected");
  const grammarEvidence = selected?.evidence.filter((evidence) =>
    ["heading-grammar", "filename-grammar", "cross-reference-grammar"].includes(evidence.strategyId),
  );

  assert.equal(story.parentId, "F-0003");
  assert.ok(grammarEvidence && grammarEvidence.length >= 2);
  assert.ok(
    grammarEvidence?.every(
      (evidence) =>
        typeof evidence.details.matchedGroup === "string" &&
        typeof evidence.details.group1 === "string",
    ),
  );
});

test("inferHierarchyRelationships uses normalized decision metadata as content-reference evidence", () => {
  const epic = createNode({
    id: "E-0004",
    type: "epic",
    title: "Payments Epic",
    sourcePath: "specs/epic-0004-payments/epic.md",
  });
  const feature = createNode({
    id: "F-0002",
    type: "feature",
    title: "Billing Orchestration",
    sourcePath: "specs/epic-0004-payments/feature-0002-billing-orchestration.md",
    parentId: "E-0004",
  });
  const story = createNode({
    id: "S-0021",
    type: "story",
    title: "Route billing step",
    sourcePath: "specs/epic-0004-payments/story-0021-route-billing.md",
    summary: "Story summary with no parent ID mention.",
    parentId: undefined,
    parserMetadata: {
      sectionOrder: ["D-0004-1"],
      unknownSections: {},
      normalizedDecisions: [
        {
          sourcePath: "specs/epic-0004-payments/story-0021-route-billing.md",
          sectionName: "D-0004-1",
          sectionOffset: { startLine: 20, endLine: 22 },
          decisionId: "D-0004-1",
          decision: "Parent should be F-0002 for billing orchestration ownership.",
          reason: "F-0002 owns all billing orchestration.",
        },
      ],
    },
  });

  const inference = inferHierarchyRelationships([epic, feature, story]);
  const selected = inference?.relationships[0]?.candidates.find((candidate) => candidate.state === "selected");
  const decisionEvidence = selected?.evidence.find((evidence) => evidence.matchedSignal === "decision-id-reference");

  assert.equal(story.parentId, "F-0002");
  assert.equal(inference?.relationships[0]?.state, "inferred");
  assert.ok(decisionEvidence);
  assert.equal(decisionEvidence?.source, "parser-metadata.normalizedDecisions");
  assert.equal(decisionEvidence?.details.sectionStartLine, 20);
});
