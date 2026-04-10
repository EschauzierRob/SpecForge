import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  composeRepository,
  ingestRepository,
  parseRepository,
  recommendRepository,
} from "../src/index.ts";
import { runCli } from "../src/cli.ts";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDirectory, "..");

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

test("recommend CLI returns JSON payload", async () => {
  const outputLines: string[] = [];
  const errorLines: string[] = [];
  const directResult = await recommendRepository(repoRoot);
  const exitCode = await runCli(
    ["recommend", repoRoot, "--json"],
    (line) => outputLines.push(line),
    (line) => errorLines.push(line),
  );

  assert.equal(exitCode, 0);
  assert.deepEqual(errorLines, []);

  const payload = JSON.parse(outputLines.join("\n"));
  assert.equal(payload.recommendations.length, directResult.recommendations.length);
});
