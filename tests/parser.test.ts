import test from "node:test";
import assert from "node:assert/strict";

import path from "node:path";

import { mapSectionsToCanonical, parseSpecFile, tokenizeSections } from "../src/index.ts";
import { createRepositoryEdgeFixture } from "./fixtures/repository-edge-fixtures.ts";

test("tokenizeSections parses the current markdown section format", () => {
  const markdown = `# Example

## ID
F-1234

## Type
Feature

## Summary
Example summary.

## Requirements
- [ ] R1: First

## Parent
E-0001
`;

  const sectionMap = tokenizeSections(markdown);

  assert.deepEqual(sectionMap.order, ["ID", "Type", "Summary", "Requirements", "Parent"]);
  assert.equal(sectionMap.sections.id, "F-1234");
  assert.equal(sectionMap.sections.parent, "E-0001");
  assert.deepEqual(sectionMap.sectionOffsets.ID, { startLine: 3, endLine: 5 });
  assert.deepEqual(sectionMap.sectionOffsets.Parent, { startLine: 15, endLine: 17 });
});

test("mapSectionsToCanonical tolerates out-of-order sections", () => {
  const parsed = mapSectionsToCanonical({
    title: "Out of Order Feature",
    sourcePath: "specs/feature.md",
    sectionMap: tokenizeSections(`## Summary
Feature summary.

## Parent
E-0001

## Requirements
- [ ] R1: Required

## Type
Feature

## ID
F-0002`),
  });

  assert.equal(parsed.node?.id, "F-0002");
  assert.equal(parsed.node?.type, "feature");
  assert.equal(parsed.node?.parentId, "E-0001");
  assert.equal(parsed.diagnostics.length, 0);
});

test("mapSectionsToCanonical reports missing required sections without crashing", () => {
  const parsed = mapSectionsToCanonical({
    title: "Broken Story",
    sourcePath: "specs/story.md",
    sectionMap: tokenizeSections(`## ID
S-0001

## Type
Story`),
  });

  assert.equal(parsed.node, undefined);
  assert.ok(parsed.diagnostics.some((diagnostic) => diagnostic.code === "missing-required-section"));
});

test("mapSectionsToCanonical preserves unknown sections as metadata and info diagnostics", () => {
  const parsed = mapSectionsToCanonical({
    title: "Feature With Extra",
    sourcePath: "specs/feature.md",
    sectionMap: tokenizeSections(`## ID
F-0004

## Type
Feature

## Parent
E-0001

## Summary
Summary text.

## Requirements
- [ ] R1: Test

## Extra Stuff
Keep me around.`),
  });

  assert.equal(parsed.node?.parserMetadata?.unknownSections["Extra Stuff"], "Keep me around.");
  assert.ok(parsed.diagnostics.some((diagnostic) => diagnostic.code === "unknown-section"));
});


test("mapSectionsToCanonical uses fallback title/summary and records marker provenance", () => {
  const rawContent = `Project Phoenix Rollout

Feature 1
Story 3.1

This document explains rollout sequencing and migration checkpoints for launch readiness.

## ID
F-0007

## Type
Feature

## Parent
E-0001

## Requirements
- [ ] R1: Keep fallback details`;

  const parsed = mapSectionsToCanonical({
    title: undefined,
    sourcePath: "specs/feature-fallback.md",
    rawContent,
    sectionMap: tokenizeSections(rawContent),
  });

  assert.equal(parsed.node?.title, "Project Phoenix Rollout");
  assert.match(parsed.node?.summary ?? "", /rollout sequencing and migration checkpoints/i);
  assert.deepEqual(parsed.node?.parserMetadata?.fallbackExtraction?.candidateMarkers, ["Feature 1", "Story 3.1"]);
  assert.ok(parsed.diagnostics.some((diagnostic) => diagnostic.code === "fallback-title"));
  assert.ok(parsed.diagnostics.some((diagnostic) => diagnostic.code === "fallback-summary"));
});

test("mapSectionsToCanonical captures normalized decision artifacts with section offsets", () => {
  const rawContent = `# Story with Decisions

## ID
S-0008

## Type
Story

## Summary
Summary without direct parent id.

## D-0004-1
- Decision: Parent should align to F-0002 billing scope.
- Reason: F-0002 owns all checkout billing orchestration.

## Parent
none

## Acceptance Criteria
- [ ] AC1`;

  const parsed = mapSectionsToCanonical({
    title: "Story with Decisions",
    sourcePath: "specs/story-with-decisions.md",
    rawContent,
    sectionMap: tokenizeSections(rawContent),
  });

  assert.equal(parsed.node?.parserMetadata?.normalizedDecisions?.length, 1);
  assert.deepEqual(parsed.node?.parserMetadata?.normalizedDecisions?.[0], {
    sourcePath: "specs/story-with-decisions.md",
    sectionName: "D-0004-1",
    sectionOffset: { startLine: 12, endLine: 15 },
    decisionId: "D-0004-1",
    decision: "Parent should align to F-0002 billing scope.",
    reason: "F-0002 owns all checkout billing orchestration.",
  });
});


test("parseSpecFile captures fallback extraction and mixed punctuation headings in edge fixture", async () => {
  const fixture = await createRepositoryEdgeFixture();
  const sourcePath = "specs/epic-1000-edge-cases/feature-1002-payment-ledger";

  const parsed = await parseSpecFile(path.join(fixture.root, sourcePath), fixture.root);

  assert.equal(parsed.node?.id, "F-1002");
  assert.equal(parsed.node?.title, "Feature B — Payment Ledger");
  assert.match(parsed.node?.summary ?? "", /embedded Feature and Story markers/i);
  assert.deepEqual(parsed.node?.parserMetadata?.fallbackExtraction?.candidateMarkers, [
    "Feature B — Payment Ledger",
    "Story 2.1",
  ]);
  assert.ok(parsed.diagnostics.some((diagnostic) => diagnostic.code === "missing-title"));
  assert.ok(parsed.diagnostics.some((diagnostic) => diagnostic.code === "fallback-title"));
  assert.ok(parsed.diagnostics.some((diagnostic) => diagnostic.code === "fallback-summary"));
});
