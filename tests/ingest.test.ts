import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { composeRepository, ingestRepository, parseRepository, parseSpecFile } from "../src/index.ts";
import { runCli } from "../src/cli.ts";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDirectory, "..");

async function createBootstrapCandidate(includeOverlayDirectory: boolean): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "specforge-bootstrap-ingest-"));
  await mkdir(path.join(root, "specs", "epic-0001-sample"), { recursive: true });
  if (includeOverlayDirectory) {
    await mkdir(path.join(root, "specforge", "overlay"), { recursive: true });
  }

  await writeFile(
    path.join(root, "specs", "epic-0001-sample", "epic.md"),
    `# Bootstrap Epic

## ID
E-0001

## Type
Epic

## Summary
Bootstrap coverage epic.

## Goals
- Keep loading resilient.

## Non-goals
- Writing project-specific content automatically.
`,
  );

  return root;
}

async function createDriftedInferenceRepo(): Promise<{ root: string; storyPath: string }> {
  const root = await mkdtemp(path.join(os.tmpdir(), "specforge-drifted-ingest-"));
  const specsPath = path.join(root, "specs", "messy-product");
  await mkdir(specsPath, { recursive: true });
  await writeFile(
    path.join(specsPath, "epic.md"),
    `# Messy Epic

## ID
E-0001

## Type
Epic

## Summary
Messy but ingestible.

## Goals
- Load drifted specs.

## Non-goals
- Rewrite files.
`,
  );
  await writeFile(
    path.join(specsPath, "feature without canonical name.md"),
    `# Payments Feature

## ID
F-0001

## Type
Feature

## Parent
E-0001

## Summary
Payments capability.

## Requirements
- R1: Accept payments.
`,
  );
  const storyPath = path.join(specsPath, "story without canonical name.md");
  await writeFile(
    storyPath,
    `# Payments Story

## ID
S-0001

## Type
Story

## Summary
This story belongs to F-0001.

## Acceptance Criteria
- AC1: The relationship is inferred.
`,
  );

  return { root, storyPath };
}

test("parseSpecFile extracts canonical fields from a real repository spec", async () => {
  const filePath = path.join(
    repoRoot,
    "specs",
    "epic-0001-foundation",
    "feature-0001-canonical-spec-model.md",
  );

  const result = await parseSpecFile(filePath, repoRoot);

  assert.equal(result.node?.id, "F-0001");
  assert.equal(result.node?.type, "feature");
  assert.equal(result.node?.parentId, "E-0001");
  assert.equal(result.node?.sourcePath, "specs/epic-0001-foundation/feature-0001-canonical-spec-model.md");
});

test("ingestRepository links deterministic childrenIds for the current repo", async () => {
  const result = await ingestRepository(repoRoot);
  const epic = result.canonicalNodes.find((node) => node.id === "E-0001");

  assert.ok(epic);
  assert.deepEqual(epic.childrenIds, ["F-0001", "F-0002", "F-0003"]);
});

test("ingestRepository ingests the current repo and sample repo successfully", async () => {
  const currentRepoResult = await ingestRepository(repoRoot);
  const sampleRepoResult = await ingestRepository(path.join(repoRoot, "examples", "sample-spec-repo"));

  assert.ok(currentRepoResult.canonicalNodes.length > 0);
  assert.equal(currentRepoResult.overlayFiles.length, 1);
  assert.equal(currentRepoResult.composedNodes.length, currentRepoResult.canonicalNodes.length);
  assert.equal(
    currentRepoResult.composedNodes.find((node) => node.spec.id === "F-0005")?.overlay?.planningStatus,
    "done",
  );
  assert.equal(sampleRepoResult.canonicalNodes.length, 1);
  assert.equal(sampleRepoResult.overlayFiles.length, 1);
  assert.equal(sampleRepoResult.composedNodes.length, 1);
  assert.equal(sampleRepoResult.canonicalNodes[0]?.id, "E-9001");
});

test("canonical repositories omit inference metadata across parse compose and ingest", async () => {
  const parseResult = await parseRepository(repoRoot);
  const composeResult = await composeRepository(repoRoot);
  const ingestResult = await ingestRepository(repoRoot);

  assert.equal(parseResult.inference, undefined);
  assert.equal(composeResult.inference, undefined);
  assert.equal(ingestResult.inference, undefined);
});

test("ingestRepository bootstraps missing overlay essentials before composition", async () => {
  const bootstrapRepoRoot = await createBootstrapCandidate(false);

  const result = await ingestRepository(bootstrapRepoRoot);

  assert.equal(result.discovery.bootstrap.createdCount, 15);
  assert.deepEqual(
    result.discovery.bootstrap.actions.map((action) => action.path),
    [
      "specforge",
      "specforge/overlay",
      "specforge/bin",
      "specforge/tools",
      "specforge/README.md",
      "specforge/overlay/README.md",
      "specforge/overlay/local-dev.overlay.json",
      "specforge/ai-coder-instructions.md",
      "AGENTS.md",
      "specforge/bin/specforge.ps1",
      "specforge/bin/specforge.cmd",
      "specforge/bin/specforge",
      "specforge/tools/specforge-cli.mjs",
      "specforge/tools/specforge-cli.manifest.json",
      "specforge/tools/README.md",
    ],
  );
  assert.equal(result.discovery.cliTooling.status, "available");
  assert.equal(result.overlayFiles.length, 1);
  assert.equal(result.overlayFiles[0]?.sourcePath, "specforge/overlay/local-dev.overlay.json");
  assert.equal(result.overlayFiles[0]?.version, "0.2");
  assert.equal(result.overlayFiles[0]?.entries.length, 0);
  assert.equal(result.overlayFiles[0]?.executionSlices.length, 0);
  assert.equal(result.composedNodes.length, 1);
  assert.equal(result.composedNodes[0]?.spec.id, "E-0001");
});

test("ingestRepository discovers drifted markdown names and attaches selected inferred parents", async () => {
  const { root, storyPath } = await createDriftedInferenceRepo();
  const before = await readFile(storyPath, "utf8");

  const result = await ingestRepository(root);
  const after = await readFile(storyPath, "utf8");
  const story = result.canonicalNodes.find((node) => node.id === "S-0001");
  const feature = result.canonicalNodes.find((node) => node.id === "F-0001");

  assert.ok(result.discovery.discoveredSpecFiles.includes("specs/messy-product/feature without canonical name.md"));
  assert.ok(result.discovery.discoveredSpecFiles.includes("specs/messy-product/story without canonical name.md"));
  assert.equal(story?.parentId, "F-0001");
  assert.deepEqual(feature?.childrenIds, ["S-0001"]);
  assert.equal(result.inference?.relationships[0]?.state, "inferred");
  assert.equal(result.inference?.relationships[0]?.selectedParentId, "F-0001");
  assert.equal(before, after);
});

test("parse/compose/ingest support adapter profile hints", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "specforge-adapter-hint-"));
  const specsPath = path.join(root, "specs", "messy-product");
  await mkdir(specsPath, { recursive: true });
  await writeFile(
    path.join(specsPath, "epic"),
    `# Adapter Epic

## ID
E-0001

## Type
Epic

## Summary
Loaded through adapter profile.
`,
  );

  const parseResult = await parseRepository(root, { adapterProfile: "bitbetmatic2" });
  const composeResult = await composeRepository(root, { adapterProfile: "bitbetmatic2" });
  const ingestResult = await ingestRepository(root, { adapterProfile: "bitbetmatic2" });

  assert.equal(parseResult.discovery.specDiscoveryProfile, "bitbetmatic2");
  assert.equal(composeResult.discovery.specDiscoveryProfile, "bitbetmatic2");
  assert.equal(ingestResult.discovery.specDiscoveryProfile, "bitbetmatic2");
  assert.deepEqual(parseResult.discovery.adapterIncludedSpecFiles, ["specs/messy-product/epic"]);
  assert.equal(parseResult.canonicalNodes[0]?.id, "E-0001");
  assert.equal(composeResult.canonicalNodes[0]?.id, "E-0001");
  assert.equal(ingestResult.canonicalNodes[0]?.id, "E-0001");
});

test("bitbetmatic slice files are exposed as inferred virtual nodes only", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "specforge-adapter-slice-"));
  const specsPath = path.join(root, "specs", "domain", "payments");
  await mkdir(specsPath, { recursive: true });
  await writeFile(
    path.join(specsPath, "epic"),
    `# Payments Platform

## ID
E-0001

## Type
Epic

## Summary
Payments domain outcomes.
`,
  );
  await writeFile(path.join(specsPath, "slice-risk-controls.md"), "# Risk controls slice\n\nSketch only.");

  const result = await ingestRepository(root, { adapterProfile: "bitbetmatic2" });

  assert.equal(result.canonicalNodes.length, 1);
  assert.equal(result.canonicalNodes[0]?.id, "E-0001");
  assert.ok(result.inference?.virtualNodes?.length === 1);
  assert.equal(result.inference?.virtualNodes?.[0]?.virtualType, "slice");
  assert.equal(result.inference?.virtualNodes?.[0]?.parentId, "E-0001");
  assert.equal(result.inference?.virtualNodes?.[0]?.sourcePath, "specs/domain/payments/slice-risk-controls.md");
  assert.equal(result.inference?.relationships.length, 1);
  assert.equal(result.inference?.relationships[0]?.childId, result.inference?.virtualNodes?.[0]?.id);
  assert.equal(result.inference?.relationships[0]?.selectedParentId, "E-0001");
  assert.ok(
    result.inference?.virtualNodes?.[0]?.evidence.some(
      (evidence) =>
        evidence.strategyId === "directory-adjacency" && evidence.matchedSignal === "nearest-epic-feature-directory",
    ),
  );
});

test("ingestRepository preserves ambiguous inferred parent candidates without selecting one", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "specforge-drifted-ambiguous-"));
  const specsPath = path.join(root, "specs", "ambiguous");
  await mkdir(specsPath, { recursive: true });
  await writeFile(
    path.join(specsPath, "epic.md"),
    `# Ambiguous Epic

## ID
E-0001

## Type
Epic

## Summary
Ambiguity coverage.

## Goals
- Keep candidates.

## Non-goals
- Guess silently.
`,
  );
  await writeFile(
    path.join(specsPath, "feature-a.md"),
    `# Checkout Alpha

## ID
F-0001

## Type
Feature

## Parent
E-0001

## Summary
First checkout candidate.

## Requirements
- R1: Exists.
`,
  );
  await writeFile(
    path.join(specsPath, "feature-b.md"),
    `# Checkout Beta

## ID
F-0002

## Type
Feature

## Parent
E-0001

## Summary
Second checkout candidate.

## Requirements
- R1: Exists.
`,
  );
  await writeFile(
    path.join(specsPath, "story-drifted.md"),
    `# Checkout Story

## ID
S-0003

## Type
Story

## Summary
No explicit parent.

## Acceptance Criteria
- AC1: Ambiguous parents are retained.
`,
  );

  const result = await ingestRepository(root);
  const story = result.canonicalNodes.find((node) => node.id === "S-0003");

  assert.equal(story?.parentId, undefined);
  assert.equal(result.inference?.relationships[0]?.state, "ambiguous");
  assert.deepEqual(
    result.inference?.relationships[0]?.candidates.map((candidate) => candidate.parentId),
    ["F-0001", "F-0002"],
  );
});

test("CLI --json output is machine-readable and stable enough for snapshots", async () => {
  const outputLines: string[] = [];
  const errorLines: string[] = [];
  const exitCode = await runCli(
    ["ingest", repoRoot, "--json"],
    (line) => outputLines.push(line),
    (line) => errorLines.push(line),
  );

  assert.equal(exitCode, 0);
  assert.deepEqual(errorLines, []);

  const payload = JSON.parse(outputLines.join("\n"));

  assert.equal(payload.discovery.repoRoot, repoRoot);
  assert.equal(payload.discovery.hasOverlayDirectory, true);
  assert.equal(payload.discovery.overlayFileCount, 1);
  assert.ok(Array.isArray(payload.canonicalNodes));
  assert.ok(Array.isArray(payload.overlayFiles));
  assert.ok(Array.isArray(payload.composedNodes));
  assert.ok(Array.isArray(payload.diagnostics));
  assert.ok(Array.isArray(payload.compositionDiagnostics));
});

test("CLI summary reflects overlay and composition counts", async () => {
  const currentRepoResult = await ingestRepository(repoRoot);
  const outputLines: string[] = [];
  const errorLines: string[] = [];
  const exitCode = await runCli(
    ["ingest", repoRoot],
    (line) => outputLines.push(line),
    (line) => errorLines.push(line),
  );

  assert.equal(exitCode, 0);
  assert.deepEqual(errorLines, []);
  assert.ok(outputLines.includes("overlay files: 1"));
  assert.ok(outputLines.includes("execution slices: 3"));
  assert.ok(outputLines.includes(`composed nodes: ${currentRepoResult.composedNodes.length}`));
  assert.ok(outputLines.some((line) => line.startsWith("composition diagnostics: ")));
});
