import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type {
  CanonicalNode,
  CompositionDiagnostic,
  IngestResult,
  OverlayFile,
  ParserDiagnostic,
} from "../src/index.ts";
import {
  runCli,
} from "../src/cli.ts";
import {
  validateIngestResult,
  validateRepository,
} from "../src/index.ts";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDirectory, "..");

function createCanonicalNode(overrides: Partial<CanonicalNode> = {}): CanonicalNode {
  return {
    id: "E-0001",
    type: "epic",
    title: "Epic",
    summary: "Epic summary",
    sourcePath: "specs/epic-0001-sample/epic.md",
    childrenIds: [],
    goals: ["Goal"],
    nonGoals: ["Non-goal"],
    ...overrides,
  };
}

function createIngestResult(overrides: Partial<IngestResult> = {}): IngestResult {
  const epic = createCanonicalNode();
  const feature = createCanonicalNode({
    id: "F-0001",
    type: "feature",
    title: "Feature",
    summary: "Feature summary",
    sourcePath: "specs/epic-0001-sample/feature-0001-feature.md",
    parentId: "E-0001",
    childrenIds: [],
    requirements: ["R1: Requirement"],
    goals: undefined,
    nonGoals: undefined,
  });
  epic.childrenIds = ["F-0001"];

  const canonicalNodes = [epic, feature];
  const overlayFiles: OverlayFile[] = [];

  return {
    discovery: {
      repoRoot: repoRoot,
      specsPath: "specs",
      overlayPath: "specforge/overlay",
      specDiscoveryProfile: "canonical",
      hasOverlayDirectory: true,
      discoveredSpecFiles: canonicalNodes.map((node) => node.sourcePath),
      adapterIncludedSpecFiles: [],
      discoveredOverlayFiles: [],
      specFileCount: canonicalNodes.length,
      overlayFileCount: 0,
      ignoredEntries: [],
      missingExpectedDirectories: [],
      bootstrap: {
        actions: [],
        createdCount: 0,
      },
    },
    canonicalNodes,
    overlayFiles,
    composedNodes: canonicalNodes.map((node) => ({ spec: node })),
    diagnostics: [],
    compositionDiagnostics: [],
    ...overrides,
  };
}

async function createBrokenRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "specforge-validate-"));
  await mkdir(path.join(root, "specs", "epic-0001-broken"), { recursive: true });
  await writeFile(
    path.join(root, "specs", "epic-0001-broken", "feature-0001-missing-parent.md"),
    `# Broken Feature

## ID
F-0001

## Type
Feature

## Summary
Broken feature.

## Requirements
- [ ] R1: Exists
`,
  );

  return root;
}

test("validateIngestResult detects V-001 missing parent", () => {
  const feature = createCanonicalNode({
    id: "F-0001",
    type: "feature",
    sourcePath: "specs/epic-0001-sample/feature-0001-feature.md",
    requirements: ["R1: Requirement"],
    parentId: undefined,
    goals: undefined,
    nonGoals: undefined,
  });
  const result = validateIngestResult(
    createIngestResult({
      canonicalNodes: [createCanonicalNode(), feature],
      composedNodes: [{ spec: createCanonicalNode() }, { spec: feature }],
    }),
  );

  assert.ok(result.findings.some((finding) => finding.ruleId === "V-001" && finding.specId === "F-0001"));
});

test("validateIngestResult detects V-003 duplicate IDs", () => {
  const duplicateA = createCanonicalNode({
    id: "F-0001",
    type: "feature",
    sourcePath: "specs/epic-0001-sample/feature-0001-a.md",
    parentId: "E-0001",
    requirements: ["R1"],
    goals: undefined,
    nonGoals: undefined,
  });
  const duplicateB = createCanonicalNode({
    id: "F-0001",
    type: "feature",
    sourcePath: "specs/epic-0001-sample/feature-0001-b.md",
    parentId: "E-0001",
    requirements: ["R1"],
    goals: undefined,
    nonGoals: undefined,
  });

  const result = validateIngestResult(
    createIngestResult({
      canonicalNodes: [createCanonicalNode(), duplicateA, duplicateB],
      composedNodes: [{ spec: createCanonicalNode() }, { spec: duplicateA }, { spec: duplicateB }],
    }),
  );

  assert.ok(result.findings.some((finding) => finding.ruleId === "V-003" && finding.specId === "F-0001"));
});

test("validateIngestResult detects V-005 malformed hierarchy", () => {
  const story = createCanonicalNode({
    id: "S-0001",
    type: "story",
    sourcePath: "specs/epic-0001-sample/story-0001-story.md",
    parentId: "E-0001",
    acceptanceCriteria: ["AC1"],
    goals: undefined,
    nonGoals: undefined,
  });

  const result = validateIngestResult(
    createIngestResult({
      canonicalNodes: [createCanonicalNode(), story],
      composedNodes: [{ spec: createCanonicalNode() }, { spec: story }],
    }),
  );

  assert.ok(result.findings.some((finding) => finding.ruleId === "V-005" && finding.specId === "S-0001"));
});

test("validateIngestResult detects V-006 missing required fields", () => {
  const feature = createCanonicalNode({
    id: "F-0001",
    type: "feature",
    title: "",
    sourcePath: "specs/epic-0001-sample/feature-0001-feature.md",
    parentId: "E-0001",
    requirements: [],
    goals: undefined,
    nonGoals: undefined,
  });

  const result = validateIngestResult(
    createIngestResult({
      canonicalNodes: [createCanonicalNode(), feature],
      composedNodes: [{ spec: createCanonicalNode() }, { spec: feature }],
    }),
  );

  assert.ok(result.findings.some((finding) => finding.ruleId === "V-006" && finding.specId === "F-0001"));
});

test("validateIngestResult detects V-007 path convention violations", () => {
  const feature = createCanonicalNode({
    id: "F-0001",
    type: "feature",
    sourcePath: "specs/epic-0001-sample/feat-0001-feature.md",
    parentId: "E-0001",
    requirements: ["R1"],
    goals: undefined,
    nonGoals: undefined,
  });

  const result = validateIngestResult(
    createIngestResult({
      canonicalNodes: [createCanonicalNode(), feature],
      composedNodes: [{ spec: createCanonicalNode() }, { spec: feature }],
    }),
  );

  assert.ok(result.findings.some((finding) => finding.ruleId === "V-007" && finding.specId === "F-0001"));
});

test("validateIngestResult emits adapter-specific V-007 warning for non-canonical but understood files", () => {
  const feature = createCanonicalNode({
    id: "F-0001",
    type: "feature",
    sourcePath: "specs/epic-0001-sample/feat-0001-feature.md",
    parentId: "E-0001",
    requirements: ["R1"],
    goals: undefined,
    nonGoals: undefined,
  });

  const result = validateIngestResult(
    createIngestResult({
      discovery: {
        ...createIngestResult().discovery,
        specDiscoveryProfile: "bitbetmatic2",
      },
      canonicalNodes: [createCanonicalNode(), feature],
      composedNodes: [{ spec: createCanonicalNode() }, { spec: feature }],
    }),
  );

  assert.ok(
    result.findings.some(
      (finding) =>
        finding.ruleId === "V-007" &&
        finding.specId === "F-0001" &&
        finding.message.includes("non-canonical but understood"),
    ),
  );
});

test("validateIngestResult emits adapter-specific V-007 warning for unparseable adapter-only files", () => {
  const result = validateIngestResult(
    createIngestResult({
      discovery: {
        ...createIngestResult().discovery,
        specDiscoveryProfile: "bitbetmatic2",
        discoveredSpecFiles: ["specs/epic-0001-sample/slice-checkout.md"],
        adapterIncludedSpecFiles: ["specs/epic-0001-sample/slice-checkout.md"],
      },
      diagnostics: [
        {
          severity: "warning",
          code: "empty-file",
          message: "Spec file is empty.",
          sourcePath: "specs/epic-0001-sample/slice-checkout.md",
        },
      ],
      inference: {
        relationships: [],
      },
    }),
  );

  assert.ok(
    result.findings.some(
      (finding) =>
        finding.ruleId === "V-007" &&
        finding.sourcePaths.includes("specs/epic-0001-sample/slice-checkout.md") &&
        finding.message.includes("currently unparseable"),
    ),
  );
});

test("validateIngestResult maps overlay validation rules from composition diagnostics and overlay data", () => {
  const overlayFiles: OverlayFile[] = [
    {
      sourcePath: "specforge/overlay/local-dev.overlay.json",
      version: "0.1",
      repositoryId: "specforge-local",
      entries: [
        {
          specId: "F-0001",
          dependencies: ["F-9999"],
        },
      ],
    },
  ];
  const compositionDiagnostics: CompositionDiagnostic[] = [
    {
      severity: "warning",
      code: "unknown-overlay-specid",
      message: "Overlay entry references unknown specId F-9998.",
      sourcePath: "specforge/overlay/local-dev.overlay.json",
      specId: "F-9998",
    },
    {
      severity: "warning",
      code: "invalid-overlay-entry",
      message: "Overlay entry for F-0001 has an invalid planningStatus.",
      sourcePath: "specforge/overlay/local-dev.overlay.json",
      specId: "F-0001",
      sectionName: "planningStatus",
    },
    {
      severity: "warning",
      code: "invalid-overlay-entry",
      message: "Overlay entry for F-0001 has an invalid rank.",
      sourcePath: "specforge/overlay/local-dev.overlay.json",
      specId: "F-0001",
      sectionName: "rank",
    },
  ];

  const result = validateIngestResult(
    createIngestResult({
      overlayFiles,
      compositionDiagnostics,
    }),
  );

  assert.ok(result.findings.some((finding) => finding.ruleId === "V-101"));
  assert.ok(result.findings.some((finding) => finding.ruleId === "V-102"));
  assert.ok(result.findings.some((finding) => finding.ruleId === "V-103"));
  assert.ok(result.findings.some((finding) => finding.ruleId === "V-104"));
});

test("validateIngestResult maps parser diagnostics into validation findings and summarizes deterministically", () => {
  const diagnostics: ParserDiagnostic[] = [
    {
      severity: "warning",
      code: "invalid-or-missing-type",
      message: "Missing or invalid Type section.",
      sourcePath: "specs/epic-0001-sample/feature-0002-invalid.md",
      specId: "F-0002",
      sectionName: "Type",
    },
    {
      severity: "warning",
      code: "missing-required-section",
      message: "Missing required section: Summary.",
      sourcePath: "specs/epic-0001-sample/task-0001-task.md",
      specId: "T-0001",
      sectionName: "Summary",
    },
  ];

  const first = validateIngestResult(createIngestResult({ diagnostics }));
  const second = validateIngestResult(createIngestResult({ diagnostics }));

  assert.deepEqual(first, second);
  assert.equal(first.summary.byRuleId["V-004"], 1);
  assert.equal(first.summary.byRuleId["V-006"], 1);
  assert.equal(first.summary.bySeverity.error, 2);
});

test("validateRepository reports no findings for the current repo", async () => {
  const result = await validateRepository(repoRoot);

  assert.equal(result.findings.length, 0);
  assert.equal(result.summary.total, 0);
});

test("validate CLI returns JSON for a clean repo and exit code 0", async () => {
  const outputLines: string[] = [];
  const errorLines: string[] = [];
  const exitCode = await runCli(
    ["validate", repoRoot, "--json"],
    (line) => outputLines.push(line),
    (line) => errorLines.push(line),
  );

  assert.equal(exitCode, 0);
  assert.deepEqual(errorLines, []);

  const payload = JSON.parse(outputLines.join("\n"));
  assert.ok(Array.isArray(payload.findings));
  assert.ok(payload.summary);
  assert.ok(payload.bootstrap);
  assert.equal(payload.summary.total, 0);
});

test("validate CLI returns exit code 1 when error findings are present", async () => {
  const brokenRepoRoot = await createBrokenRepo();
  const outputLines: string[] = [];
  const errorLines: string[] = [];
  const exitCode = await runCli(
    ["validate", brokenRepoRoot],
    (line) => outputLines.push(line),
    (line) => errorLines.push(line),
  );

  assert.equal(exitCode, 1);
  assert.deepEqual(errorLines, []);
  assert.ok(outputLines.some((line) => line.includes("V-001")));
});
