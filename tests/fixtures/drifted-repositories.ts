import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { InferenceRelationshipState } from "../../src/index.ts";

export type DriftFixtureName =
  | "missing-parent"
  | "mixed-naming"
  | "ambiguous-parent"
  | "skipped-level"
  | "flat-list"
  | "orphan-node";

interface DriftFixtureDefinition {
  directoryName: string;
  files: Record<string, string>;
  expectedRelationships: Array<{
    childId: string;
    state: InferenceRelationshipState;
    selectedParentId?: string;
    candidateParentIds?: string[];
  }>;
  expectedParentIds: Record<string, string | undefined>;
  expectedChildrenIds?: Record<string, string[]>;
}

export interface DriftFixtureRepository extends DriftFixtureDefinition {
  root: string;
  sourcePaths: string[];
}

function epicMarkdown(title = "Drift Epic"): string {
  return `# ${title}

## ID
E-0001

## Type
Epic

## Summary
Repository drift fixture.

## Goals
- Exercise tolerant ingestion.

## Non-goals
- Rewrite source files.
`;
}

function featureMarkdown(id: string, title: string, parent = "E-0001", summary = "Feature fixture."): string {
  return `# ${title}

## ID
${id}

## Type
Feature

## Parent
${parent}

## Summary
${summary}

## Requirements
- R1: Feature remains ingestible.
`;
}

function storyMarkdown(id: string, title: string, summary: string, parent?: string): string {
  return `# ${title}

## ID
${id}

## Type
Story
${parent ? `\n## Parent\n${parent}\n` : ""}
## Summary
${summary}

## Acceptance Criteria
- AC1: Story remains ingestible.
`;
}

function taskMarkdown(id: string, title: string, summary: string, parent?: string): string {
  return `# ${title}

## ID
${id}

## Type
Task
${parent ? `\n## Parent\n${parent}\n` : ""}
## Summary
${summary}

## Definition of Done
- Done when ingestion completes.
`;
}

export const driftFixtureDefinitions: Record<DriftFixtureName, DriftFixtureDefinition> = {
  "missing-parent": {
    directoryName: "missing-parent",
    files: {
      "specs/drift-missing-parent/epic.md": epicMarkdown(),
      "specs/drift-missing-parent/feature-0001-checkout.md": featureMarkdown("F-0001", "Checkout Feature"),
      "specs/drift-missing-parent/story-0001-checkout.md": storyMarkdown(
        "S-0001",
        "Checkout Story",
        "This story belongs to F-0001.",
      ),
    },
    expectedRelationships: [{ childId: "S-0001", state: "inferred", selectedParentId: "F-0001" }],
    expectedParentIds: {
      "S-0001": "F-0001",
    },
    expectedChildrenIds: {
      "F-0001": ["S-0001"],
    },
  },
  "mixed-naming": {
    directoryName: "mixed-naming",
    files: {
      "specs/drift-mixed-naming/epic.md": epicMarkdown(),
      "specs/drift-mixed-naming/feature without canonical name.md": featureMarkdown(
        "F-0001",
        "Payments Feature",
      ),
      "specs/drift-mixed-naming/story without canonical name.md": storyMarkdown(
        "S-0001",
        "Payments Story",
        "This story belongs to F-0001.",
      ),
    },
    expectedRelationships: [{ childId: "S-0001", state: "inferred", selectedParentId: "F-0001" }],
    expectedParentIds: {
      "S-0001": "F-0001",
    },
    expectedChildrenIds: {
      "F-0001": ["S-0001"],
    },
  },
  "ambiguous-parent": {
    directoryName: "ambiguous-parent",
    files: {
      "specs/drift-ambiguous/epic.md": epicMarkdown("Ambiguous Epic"),
      "specs/drift-ambiguous/feature-a.md": featureMarkdown("F-0001", "Checkout Alpha"),
      "specs/drift-ambiguous/feature-b.md": featureMarkdown("F-0002", "Checkout Beta"),
      "specs/drift-ambiguous/story-drifted.md": storyMarkdown(
        "S-0003",
        "Checkout Story",
        "No explicit parent.",
      ),
    },
    expectedRelationships: [
      {
        childId: "S-0003",
        state: "ambiguous",
        candidateParentIds: ["F-0001", "F-0002"],
      },
    ],
    expectedParentIds: {
      "S-0003": undefined,
    },
  },
  "skipped-level": {
    directoryName: "skipped-level",
    files: {
      "specs/drift-skipped-level/epic.md": epicMarkdown("Skipped Level Epic"),
      "specs/drift-skipped-level/story-without-feature.md": storyMarkdown(
        "S-0001",
        "Skipped Feature Story",
        "This story references E-0001, but no feature exists yet.",
      ),
    },
    expectedRelationships: [
      {
        childId: "S-0001",
        state: "unresolved",
        candidateParentIds: ["E-0001"],
      },
    ],
    expectedParentIds: {
      "S-0001": undefined,
    },
  },
  "flat-list": {
    directoryName: "flat-list",
    files: {
      "specs/drift-flat-list/epic.md": epicMarkdown("Flat List Epic"),
      "specs/drift-flat-list/loose-feature.md": `# Flat Feature

## ID
F-0001

## Type
Feature

## Summary
This feature belongs to E-0001.

## Requirements
- R1: Feature parent is inferred.
`,
      "specs/drift-flat-list/loose-story.md": storyMarkdown(
        "S-0001",
        "Flat Story",
        "This story belongs to F-0001.",
      ),
      "specs/drift-flat-list/loose-task.md": taskMarkdown(
        "T-0001",
        "Flat Task",
        "This task belongs to S-0001.",
      ),
    },
    expectedRelationships: [
      { childId: "F-0001", state: "inferred", selectedParentId: "E-0001" },
      { childId: "S-0001", state: "inferred", selectedParentId: "F-0001" },
      { childId: "T-0001", state: "inferred", selectedParentId: "S-0001" },
    ],
    expectedParentIds: {
      "F-0001": "E-0001",
      "S-0001": "F-0001",
      "T-0001": "S-0001",
    },
    expectedChildrenIds: {
      "E-0001": ["F-0001"],
      "F-0001": ["S-0001"],
      "S-0001": ["T-0001"],
    },
  },
  "orphan-node": {
    directoryName: "orphan-node",
    files: {
      "specs/drift-orphan/epic.md": epicMarkdown("Orphan Epic"),
      "specs/drift-orphan/lonely-feature.md": `# Lonely Capability

## ID
F-1000

## Type
Feature

## Summary
No reliable parent evidence is present.

## Requirements
- R1: Orphan remains unresolved.
`,
    },
    expectedRelationships: [
      {
        childId: "F-1000",
        state: "unresolved",
        candidateParentIds: ["E-0001"],
      },
    ],
    expectedParentIds: {
      "F-1000": undefined,
    },
  },
};

export async function createDriftFixtureRepository(name: DriftFixtureName): Promise<DriftFixtureRepository> {
  const definition = driftFixtureDefinitions[name];
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), `specforge-fixture-${definition.directoryName}-`));
  const sourcePaths = Object.keys(definition.files);

  for (const [relativePath, content] of Object.entries(definition.files)) {
    const fullPath = path.join(repoRoot, relativePath);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, "utf8");
  }

  return {
    root: repoRoot,
    sourcePaths,
    ...definition,
  };
}
