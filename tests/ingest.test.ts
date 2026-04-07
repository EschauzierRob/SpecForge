import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ingestRepository, parseSpecFile } from "../src/index.ts";
import { runCli } from "../src/cli.ts";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDirectory, "..");

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
    "ready",
  );
  assert.equal(sampleRepoResult.canonicalNodes.length, 1);
  assert.equal(sampleRepoResult.overlayFiles.length, 1);
  assert.equal(sampleRepoResult.composedNodes.length, 1);
  assert.equal(sampleRepoResult.canonicalNodes[0]?.id, "E-9001");
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
  assert.ok(outputLines.includes("composed nodes: 25"));
  assert.ok(outputLines.some((line) => line.startsWith("composition diagnostics: ")));
});
