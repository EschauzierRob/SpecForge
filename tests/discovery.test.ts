import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { discoverRepository } from "../src/index.ts";
import { runCli } from "../src/cli.ts";
import { createCliToolingFileContents } from "../src/core/ingest/cli-tooling.ts";
import { createRepositoryEdgeFixture } from "./fixtures/repository-edge-fixtures.ts";

async function createTempRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "specforge-discovery-"));
  await mkdir(path.join(root, "specs", "epic-0001-sample"), { recursive: true });
  await mkdir(path.join(root, "specforge", "overlay"), { recursive: true });
  return root;
}

async function createBootstrapCandidate(includeOverlayDirectory: boolean): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "specforge-bootstrap-discovery-"));
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

async function installGeneratedCli(root: string, version: "0.1.0" | "0.2.0"): Promise<void> {
  for (const [relativePath, content] of createCliToolingFileContents(version)) {
    const targetPath = path.join(root, relativePath);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, content, "utf8");
  }
}

async function executeLocalCli(
  root: string,
  command: string,
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [path.join(root, "specforge", "tools", "specforge-cli.mjs"), command, root, "--json"],
      { encoding: "utf8" },
      (error, stdout, stderr) => {
        resolve({
          exitCode: typeof error?.code === "number" ? error.code : 0,
          stdout,
          stderr,
        });
      },
    );
  });
}

test("discoverRepository rejects an invalid path", async () => {
  await assert.rejects(() => discoverRepository(path.join(os.tmpdir(), "specforge-does-not-exist")));
});

test("discoverRepository returns deterministic file order for a valid repo", async () => {
  const root = await createTempRepo();
  await writeFile(path.join(root, "specs", "epic-0001-sample", "feature-0002-zeta.md"), "# Zeta\n");
  await writeFile(path.join(root, "specs", "epic-0001-sample", "feature-0001-alpha.md"), "# Alpha\n");
  await writeFile(path.join(root, "specs", "epic-0001-sample", "epic.md"), "# Epic\n");
  await writeFile(
    path.join(root, "specforge", "overlay", "local-dev.overlay.json"),
    JSON.stringify({ version: "0.1", repositoryId: "temp", entries: [] }),
  );

  const discovery = await discoverRepository(root);

  assert.equal(discovery.hasOverlayDirectory, true);
  assert.deepEqual(discovery.discoveredSpecFiles, [
    "specs/epic-0001-sample/epic.md",
    "specs/epic-0001-sample/feature-0001-alpha.md",
    "specs/epic-0001-sample/feature-0002-zeta.md",
  ]);
  assert.deepEqual(discovery.discoveredOverlayFiles, ["specforge/overlay/local-dev.overlay.json"]);
  assert.equal(discovery.overlayFileCount, 1);
});

test("discoverRepository ignores hidden and excluded directories", async () => {
  const root = await createTempRepo();
  await mkdir(path.join(root, "specs", ".hidden"), { recursive: true });
  await mkdir(path.join(root, "specs", "node_modules"), { recursive: true });
  await mkdir(path.join(root, "specs", "epic-0001-sample", ".ignored"), { recursive: true });
  await mkdir(path.join(root, "specforge", "overlay", ".hidden"), { recursive: true });
  await mkdir(path.join(root, "specforge", "overlay", "schema"), { recursive: true });
  await mkdir(path.join(root, "specforge", "overlay", "node_modules"), { recursive: true });
  await writeFile(path.join(root, "specs", ".hidden", "feature-0001-hidden.md"), "# Hidden\n");
  await writeFile(path.join(root, "specs", "node_modules", "feature-0002-package.md"), "# Package\n");
  await writeFile(path.join(root, "specs", "epic-0001-sample", "epic.md"), "# Epic\n");
  await writeFile(
    path.join(root, "specforge", "overlay", ".hidden", "hidden.overlay.json"),
    JSON.stringify({ version: "0.1", repositoryId: "temp", entries: [] }),
  );
  await writeFile(
    path.join(root, "specforge", "overlay", "schema", "schema.overlay.json"),
    JSON.stringify({ version: "0.1", repositoryId: "temp", entries: [] }),
  );
  await writeFile(
    path.join(root, "specforge", "overlay", "node_modules", "module.overlay.json"),
    JSON.stringify({ version: "0.1", repositoryId: "temp", entries: [] }),
  );
  await writeFile(
    path.join(root, "specforge", "overlay", "local-dev.overlay.json"),
    JSON.stringify({ version: "0.1", repositoryId: "temp", entries: [] }),
  );

  const discovery = await discoverRepository(root);

  assert.deepEqual(discovery.discoveredSpecFiles, ["specs/epic-0001-sample/epic.md"]);
  assert.deepEqual(discovery.discoveredOverlayFiles, ["specforge/overlay/local-dev.overlay.json"]);
  assert.ok(discovery.ignoredEntries.includes("specs/.hidden"));
  assert.ok(discovery.ignoredEntries.includes("specs/node_modules"));
  assert.ok(discovery.ignoredEntries.includes("specforge/overlay/.hidden"));
  assert.ok(discovery.ignoredEntries.includes("specforge/overlay/schema"));
  assert.ok(discovery.ignoredEntries.includes("specforge/overlay/node_modules"));
});

test("discoverRepository defaults to canonical profile", async () => {
  const root = await createTempRepo();
  await writeFile(path.join(root, "specs", "epic-0001-sample", "epic.md"), "# Epic\n");
  await writeFile(path.join(root, "specs", "epic-0001-sample", "notes"), "# Extensionless note\n");
  await writeFile(path.join(root, "specs", "epic-0001-sample", "brainstorm.markdown"), "# Markdown-like note\n");

  const discovery = await discoverRepository(root);

  assert.equal(discovery.specDiscoveryProfile, "canonical");
  assert.deepEqual(discovery.discoveredSpecFiles, ["specs/epic-0001-sample/epic.md"]);
  assert.deepEqual(discovery.adapterIncludedSpecFiles, []);
});

test("discoverRepository supports tolerant adapter profile for extensionless and markdown-like files", async () => {
  const root = await createTempRepo();
  await writeFile(path.join(root, "specs", "epic-0001-sample", "epic.md"), "# Epic\n");
  await writeFile(path.join(root, "specs", "epic-0001-sample", "notes"), "# Extensionless note\n");
  await writeFile(path.join(root, "specs", "epic-0001-sample", "brainstorm.markdown"), "# Markdown-like note\n");
  await mkdir(path.join(root, "specs", "templates"), { recursive: true });
  await writeFile(path.join(root, "specs", "templates", "rough.markdown"), "# Template doc\n");

  const discovery = await discoverRepository(root, { adapterProfile: "bitbetmatic2" });

  assert.equal(discovery.specDiscoveryProfile, "bitbetmatic2");
  assert.deepEqual(discovery.discoveredSpecFiles, [
    "specs/epic-0001-sample/brainstorm.markdown",
    "specs/epic-0001-sample/epic.md",
    "specs/epic-0001-sample/notes",
  ]);
  assert.deepEqual(discovery.adapterIncludedSpecFiles, [
    "specs/epic-0001-sample/brainstorm.markdown",
    "specs/epic-0001-sample/notes",
  ]);
  assert.ok(!discovery.discoveredSpecFiles.includes("specs/templates/rough.markdown"));
});

test("discoverRepository bootstraps the overlay directory and seeded local overlay file when missing", async () => {
  const root = await createBootstrapCandidate(false);

  const discovery = await discoverRepository(root);

  assert.equal(discovery.hasOverlayDirectory, true);
  assert.deepEqual(
    discovery.bootstrap.actions,
    [
      { kind: "directory", path: "specforge" },
      { kind: "directory", path: "specforge/overlay" },
      { kind: "directory", path: "specforge/bin" },
      { kind: "directory", path: "specforge/tools" },
      { kind: "file", path: "specforge/README.md" },
      { kind: "file", path: "specforge/overlay/README.md" },
      { kind: "file", path: "specforge/overlay/local-dev.overlay.json" },
      { kind: "file", path: "specforge/ai-coder-instructions.md" },
      { kind: "file", path: "AGENTS.md" },
      { kind: "file", path: "specforge/bin/specforge.ps1" },
      { kind: "file", path: "specforge/bin/specforge.cmd" },
      { kind: "file", path: "specforge/bin/specforge" },
      { kind: "file", path: "specforge/tools/specforge-cli.mjs" },
      { kind: "file", path: "specforge/tools/specforge-cli.manifest.json" },
      { kind: "file", path: "specforge/tools/README.md" },
    ],
  );
  assert.equal(discovery.bootstrap.createdCount, 15);
  assert.deepEqual(discovery.discoveredOverlayFiles, ["specforge/overlay/local-dev.overlay.json"]);
  assert.equal(discovery.cliTooling.status, "available");
  assert.deepEqual(discovery.cliTooling.launchers, [
    "specforge/bin/specforge.ps1",
    "specforge/bin/specforge.cmd",
    "specforge/bin/specforge",
  ]);
  assert.equal(discovery.cliTooling.runtimePath, "specforge/tools/specforge-cli.mjs");
  assert.equal(discovery.cliTooling.manifestPath, "specforge/tools/specforge-cli.manifest.json");
  assert.equal(discovery.cliTooling.version, "0.2.0");

  const overlayPayload = JSON.parse(
    await readFile(path.join(root, "specforge", "overlay", "local-dev.overlay.json"), "utf8"),
  ) as {
    version: string;
    repositoryId: string;
    entries: unknown[];
    executionSlices: unknown[];
  };

  assert.equal(overlayPayload.version, "0.2");
  assert.equal(overlayPayload.repositoryId, path.basename(root));
  assert.deepEqual(overlayPayload.entries, []);
  assert.deepEqual(overlayPayload.executionSlices, []);

  const aiInstructions = await readFile(path.join(root, "specforge", "ai-coder-instructions.md"), "utf8");
  assert.match(aiInstructions, /Read `\/specs` before implementing/);
  assert.match(aiInstructions, /specforge\/bin\/specforge validate \./);
  assert.match(aiInstructions, /specforge\/overlay\/local-dev\.overlay\.json/);
  assert.match(aiInstructions, /tagged `incidental`/);
  assert.match(aiInstructions, /## Canonical Spec Authoring/);
  assert.match(aiInstructions, /Do not use YAML frontmatter/);
  assert.match(aiInstructions, /Valid canonical types are exactly/);
  assert.match(aiInstructions, /`Epic`/);
  assert.match(aiInstructions, /`Feature`/);
  assert.match(aiInstructions, /`Story`/);
  assert.match(aiInstructions, /`Task`/);
  assert.doesNotMatch(aiInstructions, /`Decision`/);
  assert.match(aiInstructions, /# <Title>/);
  assert.match(aiInstructions, /## ID/);
  assert.match(aiInstructions, /## Parent/);
  assert.match(aiInstructions, /- \[ \] R1: <requirement>/);
  assert.match(aiInstructions, /- \[ \] AC1: <observable outcome>/);
  assert.match(aiInstructions, /Epic -> Feature -> Story -> Task/);
  assert.match(aiInstructions, /Every non-epic spec must set `## Parent` to its direct parent ID/);
  assert.match(aiInstructions, /Do not rely on markdown nesting to imply hierarchy/);
  assert.match(aiInstructions, /specs\/\n  epic-0001-short-name\/\n    epic\.md/);
  assert.match(aiInstructions, /feature-0001-short-name\.md/);
  assert.match(aiInstructions, /story-0001-short-name\.md/);
  assert.match(aiInstructions, /task-0001-short-name\.md/);
  assert.match(aiInstructions, /Each feature, story, and task must be its own canonical file/);
  assert.match(aiInstructions, /Overlay entries link to canonical specs by the value in the spec's `## ID` section/);
  assert.match(aiInstructions, /Canonical `## Dependencies` sections contain semantic\/product spec ID dependencies/);

  const agentsInstructions = await readFile(path.join(root, "AGENTS.md"), "utf8");
  assert.match(agentsInstructions, /specforge\/ai-coder-instructions\.md/);
});

test("discoverRepository bootstraps missing essentials when the overlay directory already exists", async () => {
  const root = await createBootstrapCandidate(true);

  const discovery = await discoverRepository(root);

  assert.deepEqual(discovery.bootstrap.actions, [
    { kind: "directory", path: "specforge/bin" },
    { kind: "directory", path: "specforge/tools" },
    { kind: "file", path: "specforge/README.md" },
    { kind: "file", path: "specforge/overlay/README.md" },
    { kind: "file", path: "specforge/overlay/local-dev.overlay.json" },
    { kind: "file", path: "specforge/ai-coder-instructions.md" },
    { kind: "file", path: "AGENTS.md" },
    { kind: "file", path: "specforge/bin/specforge.ps1" },
    { kind: "file", path: "specforge/bin/specforge.cmd" },
    { kind: "file", path: "specforge/bin/specforge" },
    { kind: "file", path: "specforge/tools/specforge-cli.mjs" },
    { kind: "file", path: "specforge/tools/specforge-cli.manifest.json" },
    { kind: "file", path: "specforge/tools/README.md" },
  ]);
  assert.equal(discovery.bootstrap.createdCount, 13);
  assert.deepEqual(discovery.discoveredOverlayFiles, ["specforge/overlay/local-dev.overlay.json"]);
});

test("discoverRepository preserves existing root agent instructions during bootstrap", async () => {
  const root = await createBootstrapCandidate(false);
  const existingAgents = "# Existing Agent Rules\n\nKeep project-specific instructions intact.\n";
  await writeFile(path.join(root, "AGENTS.md"), existingAgents);

  const discovery = await discoverRepository(root);

  assert.equal(discovery.bootstrap.createdCount, 14);
  assert.ok(!discovery.bootstrap.actions.some((action) => action.path === "AGENTS.md"));
  assert.equal(await readFile(path.join(root, "AGENTS.md"), "utf8"), existingAgents);
});

test("discoverRepository bootstrap is idempotent for AI instruction files", async () => {
  const root = await createBootstrapCandidate(false);

  const first = await discoverRepository(root);
  const before = await readFile(path.join(root, "specforge", "ai-coder-instructions.md"), "utf8");
  const second = await discoverRepository(root);
  const after = await readFile(path.join(root, "specforge", "ai-coder-instructions.md"), "utf8");

  assert.equal(first.bootstrap.createdCount, 15);
  assert.equal(second.bootstrap.createdCount, 0);
  assert.deepEqual(second.bootstrap.actions, []);
  assert.equal(after, before);
});

test("discoverRepository repairs partial local CLI tooling and reports availability", async () => {
  const root = await createBootstrapCandidate(false);
  await discoverRepository(root);
  await rm(path.join(root, "specforge", "tools", "specforge-cli.manifest.json"));

  const discovery = await discoverRepository(root);

  assert.equal(discovery.bootstrap.createdCount, 1);
  assert.deepEqual(discovery.bootstrap.actions, [
    { kind: "file", path: "specforge/tools/specforge-cli.manifest.json" },
  ]);
  assert.equal(discovery.cliTooling.status, "available");
  assert.equal(discovery.cliTooling.manifestPath, "specforge/tools/specforge-cli.manifest.json");
});

test("discoverRepository upgrades an untouched v0.1 consumer to v0.2 idempotently", async () => {
  const root = await createBootstrapCandidate(true);
  const legacyEntries = [
    {
      specId: "E-0001",
      planningStatus: "ready",
      notes: "Preserve this consumer-owned value.",
    },
  ];
  const overlayPath = path.join(root, "specforge", "overlay", "local-dev.overlay.json");
  await writeFile(
    overlayPath,
    `${JSON.stringify({ version: "0.1", repositoryId: "legacy-consumer", entries: legacyEntries }, null, 2)}\n`,
  );
  await installGeneratedCli(root, "0.1.0");

  const first = await discoverRepository(root);
  const migratedOverlay = JSON.parse(await readFile(overlayPath, "utf8"));
  const migratedManifest = JSON.parse(
    await readFile(path.join(root, "specforge", "tools", "specforge-cli.manifest.json"), "utf8"),
  );

  assert.equal(migratedOverlay.version, "0.2");
  assert.equal(migratedOverlay.repositoryId, "legacy-consumer");
  assert.deepEqual(migratedOverlay.entries, legacyEntries);
  assert.deepEqual(migratedOverlay.executionSlices, []);
  assert.equal(migratedManifest.version, "0.2.0");
  assert.deepEqual(
    Object.keys(migratedManifest.managedFiles).sort(),
    [
      "specforge/bin/specforge",
      "specforge/bin/specforge.cmd",
      "specforge/bin/specforge.ps1",
      "specforge/tools/README.md",
      "specforge/tools/specforge-cli.mjs",
    ],
  );
  assert.equal(first.cliTooling.status, "available");
  assert.equal(first.cliTooling.version, "0.2.0");
  assert.ok(first.bootstrap.actions.some(
    (action) => action.path === "specforge/overlay/local-dev.overlay.json" && action.operation === "updated",
  ));
  assert.ok(first.bootstrap.actions.some(
    (action) => action.path === "specforge/tools/specforge-cli.manifest.json" && action.operation === "updated",
  ));

  const compose = await executeLocalCli(root, "compose");
  assert.equal(compose.exitCode, 0, compose.stderr);
  assert.deepEqual(JSON.parse(compose.stdout).overlayFiles[0].executionSlices, []);

  migratedOverlay.executionSlices = [
    { sliceId: "SL-0001", planningStatus: "in_progress" },
    { sliceId: "SL-0002", planningStatus: "blocked" },
  ];
  await writeFile(overlayPath, `${JSON.stringify(migratedOverlay, null, 2)}\n`);
  const validate = await executeLocalCli(root, "validate");
  assert.equal(validate.exitCode, 1);
  assert.equal(JSON.parse(validate.stdout).summary.byRuleId["V-203"], 1);

  migratedOverlay.executionSlices = [];
  await writeFile(overlayPath, `${JSON.stringify(migratedOverlay, null, 2)}\n`);
  const second = await discoverRepository(root);
  assert.deepEqual(second.bootstrap.actions, []);
  assert.equal(second.bootstrap.createdCount, 0);
});

test("discoverRepository preserves customized v0.1 CLI artifacts and reports the skipped upgrade", async () => {
  const root = await createBootstrapCandidate(true);
  const overlayPath = path.join(root, "specforge", "overlay", "local-dev.overlay.json");
  await writeFile(
    overlayPath,
    `${JSON.stringify({ version: "0.1", repositoryId: "custom-consumer", entries: [] }, null, 2)}\n`,
  );
  await installGeneratedCli(root, "0.1.0");
  const runtimePath = path.join(root, "specforge", "tools", "specforge-cli.mjs");
  const customizedRuntime = `${await readFile(runtimePath, "utf8")}\n// consumer customization\n`;
  await writeFile(runtimePath, customizedRuntime);

  const discovery = await discoverRepository(root);
  const manifest = JSON.parse(
    await readFile(path.join(root, "specforge", "tools", "specforge-cli.manifest.json"), "utf8"),
  );

  assert.equal(await readFile(runtimePath, "utf8"), customizedRuntime);
  assert.equal(manifest.version, "0.1.0");
  assert.equal(discovery.cliTooling.status, "customized");
  assert.equal(discovery.cliTooling.version, "0.1.0");
  assert.ok(discovery.bootstrap.actions.some(
    (action) =>
      action.path === "specforge/tools/specforge-cli.manifest.json"
      && action.operation === "skipped"
      && action.reason?.includes("customized"),
  ));
  assert.equal(JSON.parse(await readFile(overlayPath, "utf8")).version, "0.2");
});

test("discoverRepository does not promote a customized v0.1 manifest", async () => {
  const root = await createBootstrapCandidate(true);
  await installGeneratedCli(root, "0.1.0");
  const manifestPath = path.join(root, "specforge", "tools", "specforge-cli.manifest.json");
  const customizedManifest = JSON.parse(await readFile(manifestPath, "utf8"));
  customizedManifest.consumerNote = "keep this";
  const customizedContent = `${JSON.stringify(customizedManifest, null, 2)}\n`;
  await writeFile(manifestPath, customizedContent);

  const discovery = await discoverRepository(root);

  assert.equal(await readFile(manifestPath, "utf8"), customizedContent);
  assert.equal(discovery.cliTooling.status, "customized");
  assert.ok(discovery.bootstrap.actions.some(
    (action) => action.path === "specforge/tools/specforge-cli.manifest.json"
      && action.operation === "skipped",
  ));
});

test("discoverRepository leaves unsupported v0.1 overlays untouched and reports the skipped migration", async () => {
  const root = await createBootstrapCandidate(true);
  const overlayPath = path.join(root, "specforge", "overlay", "local-dev.overlay.json");
  const unsupportedOverlay = {
    version: "0.1",
    repositoryId: "legacy-consumer",
    entries: [],
    consumerExtension: { owner: "consumer" },
  };
  const originalContent = `${JSON.stringify(unsupportedOverlay, null, 2)}\n`;
  await writeFile(overlayPath, originalContent);

  const discovery = await discoverRepository(root);

  assert.equal(await readFile(overlayPath, "utf8"), originalContent);
  assert.ok(discovery.bootstrap.actions.some(
    (action) =>
      action.path === "specforge/overlay/local-dev.overlay.json"
      && action.operation === "skipped"
      && action.reason?.includes("not safe"),
  ));
});

test("bootstrapped local CLI tooling is detectable and command-compatible", async () => {
  const root = await createBootstrapCandidate(false);
  await discoverRepository(root);
  const runtimePath = path.join(root, "specforge", "tools", "specforge-cli.mjs");
  const runtime = await readFile(runtimePath, "utf8");
  const parseOutputLines: string[] = [];
  const composeOutputLines: string[] = [];
  const validateOutputLines: string[] = [];

  assert.match(runtime, /validCommands = new Set\(\["parse", "compose", "ingest", "validate"\]\)/);

  const parseExitCode = await runCli(["parse", root, "--json"], (line) => parseOutputLines.push(line), () => {});
  assert.equal(parseExitCode, 0);
  const parsePayload = JSON.parse(parseOutputLines.join("\n"));
  assert.equal(parsePayload.canonicalNodes[0]?.id, "E-0001");
  assert.equal(parsePayload.discovery.cliTooling.status, "available");

  const composeExitCode = await runCli(["compose", root, "--json"], (line) => composeOutputLines.push(line), () => {});
  assert.equal(composeExitCode, 0);
  const composePayload = JSON.parse(composeOutputLines.join("\n"));
  assert.equal(composePayload.overlayFiles.length, 1);
  assert.equal(composePayload.composedNodes.length, 1);

  const validateExitCode = await runCli(["validate", root, "--json"], (line) => validateOutputLines.push(line), () => {});
  assert.equal(validateExitCode, 0);
  const validatePayload = JSON.parse(validateOutputLines.join("\n"));
  assert.equal(validatePayload.summary.bySeverity.error, 0);
});

test("discoverRepository adds SpecForge npm scripts only when package scripts are available", async () => {
  const root = await createBootstrapCandidate(false);
  await writeFile(
    path.join(root, "package.json"),
    JSON.stringify({
      name: "bootstrap-package",
      scripts: {
        "specforge:compose": "custom command",
      },
    }, null, 2),
  );

  const discovery = await discoverRepository(root);
  const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));

  assert.ok(discovery.bootstrap.actions.some((action) => action.path === "package.json"));
  assert.equal(packageJson.scripts["specforge:parse"], "node ./specforge/tools/specforge-cli.mjs parse .");
  assert.equal(packageJson.scripts["specforge:compose"], "custom command");
  assert.equal(packageJson.scripts["specforge:validate"], "node ./specforge/tools/specforge-cli.mjs validate .");
});


test("discoverRepository includes extensionless and slice artifacts for tolerant profile", async () => {
  const fixture = await createRepositoryEdgeFixture();

  const discovery = await discoverRepository(fixture.root, { adapterProfile: "bitbetmatic2" });

  assert.ok(discovery.discoveredSpecFiles.includes("specs/epic-1000-edge-cases/feature-1002-payment-ledger"));
  assert.ok(discovery.discoveredSpecFiles.includes("specs/epic-1000-edge-cases/slice-ledger-observability.md"));
  assert.ok(discovery.discoveredSpecFiles.includes("specs/epic-1000-edge-cases/plan.md"));
  assert.ok(discovery.adapterIncludedSpecFiles.includes("specs/epic-1000-edge-cases/feature-1002-payment-ledger"));
  assert.ok(discovery.adapterIncludedSpecFiles.includes("specs/epic-1000-edge-cases/plan.md"));
});
