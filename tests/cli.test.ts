import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  composeRepository,
  ingestRepository,
  parseRepository,
} from "../src/index.ts";
import { runCli } from "../src/cli.ts";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDirectory, "..");

async function createBootstrapCandidate(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "specforge-bootstrap-cli-"));
  await mkdir(path.join(root, "specs", "epic-0001-sample"), { recursive: true });
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

test("parseRepository returns canonical-only payload", async () => {
  const result = await parseRepository(repoRoot);

  assert.ok(Array.isArray(result.canonicalNodes));
  assert.ok(Array.isArray(result.diagnostics));
  assert.equal("overlayFiles" in result, false);
  assert.equal("composedNodes" in result, false);
});

test("composeRepository matches ingestRepository", async () => {
  const composeResult = await composeRepository(repoRoot);
  const ingestResult = await ingestRepository(repoRoot);

  assert.deepEqual(composeResult, ingestResult);
});

test("parse CLI returns JSON payload", async () => {
  const outputLines: string[] = [];
  const errorLines: string[] = [];
  const exitCode = await runCli(
    ["parse", repoRoot, "--json"],
    (line) => outputLines.push(line),
    (line) => errorLines.push(line),
  );

  assert.equal(exitCode, 0);
  assert.deepEqual(errorLines, []);

  const payload = JSON.parse(outputLines.join("\n"));
  assert.ok(Array.isArray(payload.canonicalNodes));
  assert.ok(Array.isArray(payload.diagnostics));
  assert.equal("overlayFiles" in payload, false);
});

test("compose CLI routes separately from ingest and keeps ingest compatibility", async () => {
  const composeOutputLines: string[] = [];
  const ingestOutputLines: string[] = [];

  const composeExitCode = await runCli(["compose", repoRoot], (line) => composeOutputLines.push(line), () => {});
  const ingestExitCode = await runCli(["ingest", repoRoot], (line) => ingestOutputLines.push(line), () => {});

  assert.equal(composeExitCode, 0);
  assert.equal(ingestExitCode, 0);
  assert.ok(composeOutputLines.includes("overlay files: 1"));
  assert.ok(ingestOutputLines.includes("overlay files: 1"));
  assert.ok(composeOutputLines.includes("execution slices: 1"));
  assert.ok(ingestOutputLines.includes("execution slices: 1"));
});

test("CLI writes JSON artifacts and creates nested output directories", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "specforge-cli-output-"));
  const outputPath = path.join(tempRoot, "nested", "artifacts", "parse-result.json");
  const outputLines: string[] = [];
  const errorLines: string[] = [];

  const exitCode = await runCli(
    ["parse", repoRoot, "--output", outputPath],
    (line) => outputLines.push(line),
    (line) => errorLines.push(line),
  );

  assert.equal(exitCode, 0);
  assert.deepEqual(errorLines, []);
  assert.ok(outputLines.some((line) => line.startsWith("repo root: ")));

  const written = JSON.parse(await readFile(outputPath, "utf8"));
  assert.ok(Array.isArray(written.canonicalNodes));
  assert.ok(Array.isArray(written.diagnostics));
});

test("CLI supports --json together with --output deterministically", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "specforge-cli-json-output-"));
  const outputPath = path.join(tempRoot, "compose-result.json");
  const outputLines: string[] = [];
  const errorLines: string[] = [];

  const exitCode = await runCli(
    ["compose", repoRoot, "--json", "--output", outputPath],
    (line) => outputLines.push(line),
    (line) => errorLines.push(line),
  );

  assert.equal(exitCode, 0);
  assert.deepEqual(errorLines, []);

  const stdoutPayload = JSON.parse(outputLines.join("\n"));
  const filePayload = JSON.parse(await readFile(outputPath, "utf8"));
  assert.deepEqual(stdoutPayload, filePayload);
});

test("compose CLI reports bootstrap actions when required artifacts are created", async () => {
  const bootstrapRepoRoot = await createBootstrapCandidate();
  const outputLines: string[] = [];
  const errorLines: string[] = [];

  const exitCode = await runCli(
    ["compose", bootstrapRepoRoot],
    (line) => outputLines.push(line),
    (line) => errorLines.push(line),
  );

  assert.equal(exitCode, 0);
  assert.deepEqual(errorLines, []);
  assert.ok(outputLines.includes("bootstrap created artifacts: 15"));
  assert.ok(outputLines.includes("bootstrap created directory: specforge"));
  assert.ok(outputLines.includes("bootstrap created directory: specforge/overlay"));
  assert.ok(outputLines.includes("bootstrap created directory: specforge/bin"));
  assert.ok(outputLines.includes("bootstrap created directory: specforge/tools"));
  assert.ok(outputLines.includes("bootstrap created file: specforge/README.md"));
  assert.ok(outputLines.includes("bootstrap created file: specforge/overlay/README.md"));
  assert.ok(outputLines.includes("bootstrap created file: specforge/overlay/local-dev.overlay.json"));
  assert.ok(outputLines.includes("bootstrap created file: specforge/ai-coder-instructions.md"));
  assert.ok(outputLines.includes("bootstrap created file: AGENTS.md"));
  assert.ok(outputLines.includes("bootstrap created file: specforge/bin/specforge.ps1"));
  assert.ok(outputLines.includes("bootstrap created file: specforge/bin/specforge.cmd"));
  assert.ok(outputLines.includes("bootstrap created file: specforge/bin/specforge"));
  assert.ok(outputLines.includes("bootstrap created file: specforge/tools/specforge-cli.mjs"));
  assert.ok(outputLines.includes("bootstrap created file: specforge/tools/specforge-cli.manifest.json"));
  assert.ok(outputLines.includes("bootstrap created file: specforge/tools/README.md"));
  assert.ok(outputLines.includes("specforge cli tooling: available"));
  assert.ok(outputLines.includes("overlay files: 1"));
});

test("CLI usage errors still return exit code 1", async () => {
  const errorLines: string[] = [];
  const exitCode = await runCli(
    ["unknown", repoRoot],
    () => {},
    (line) => errorLines.push(line),
  );

  assert.equal(exitCode, 1);
  assert.ok(errorLines.some((line) => line.startsWith("Usage: specforge")));
});

test("parse CLI supports --adapter for tolerant discovery", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "specforge-cli-adapter-"));
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
Loaded through CLI adapter option.
`,
  );

  const outputLines: string[] = [];
  const errorLines: string[] = [];
  const exitCode = await runCli(
    ["parse", root, "--adapter", "bitbetmatic2", "--json"],
    (line) => outputLines.push(line),
    (line) => errorLines.push(line),
  );

  assert.equal(exitCode, 0);
  assert.deepEqual(errorLines, []);

  const payload = JSON.parse(outputLines.join("\n"));
  assert.equal(payload.discovery.specDiscoveryProfile, "bitbetmatic2");
  assert.equal(payload.canonicalNodes[0]?.id, "E-0001");
});
