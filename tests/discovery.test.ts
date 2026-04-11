import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { discoverRepository } from "../src/index.ts";

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
      { kind: "file", path: "specforge/overlay/local-dev.overlay.json" },
    ],
  );
  assert.equal(discovery.bootstrap.createdCount, 3);
  assert.deepEqual(discovery.discoveredOverlayFiles, ["specforge/overlay/local-dev.overlay.json"]);

  const overlayPayload = JSON.parse(
    await readFile(path.join(root, "specforge", "overlay", "local-dev.overlay.json"), "utf8"),
  ) as {
    version: string;
    repositoryId: string;
    entries: unknown[];
  };

  assert.equal(overlayPayload.version, "0.1");
  assert.equal(overlayPayload.repositoryId, path.basename(root));
  assert.deepEqual(overlayPayload.entries, []);
});

test("discoverRepository bootstraps only the local overlay file when the directory already exists", async () => {
  const root = await createBootstrapCandidate(true);

  const discovery = await discoverRepository(root);

  assert.deepEqual(discovery.bootstrap.actions, [
    { kind: "file", path: "specforge/overlay/local-dev.overlay.json" },
  ]);
  assert.equal(discovery.bootstrap.createdCount, 1);
  assert.deepEqual(discovery.discoveredOverlayFiles, ["specforge/overlay/local-dev.overlay.json"]);
});
