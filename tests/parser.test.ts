import test from "node:test";
import assert from "node:assert/strict";

import { mapSectionsToCanonical, tokenizeSections } from "../src/index.ts";

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
