import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { discoverRepository } from "../src/index.ts";

async function createTempRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "specforge-discovery-"));
  await mkdir(path.join(root, "specs", "epic-0001-sample"), { recursive: true });
  await mkdir(path.join(root, "specforge", "overlay"), { recursive: true });
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

  const discovery = await discoverRepository(root);

  assert.equal(discovery.hasOverlayDirectory, true);
  assert.deepEqual(discovery.discoveredSpecFiles, [
    "specs/epic-0001-sample/epic.md",
    "specs/epic-0001-sample/feature-0001-alpha.md",
    "specs/epic-0001-sample/feature-0002-zeta.md",
  ]);
});

test("discoverRepository ignores hidden and excluded directories", async () => {
  const root = await createTempRepo();
  await mkdir(path.join(root, "specs", ".hidden"), { recursive: true });
  await mkdir(path.join(root, "specs", "node_modules"), { recursive: true });
  await mkdir(path.join(root, "specs", "epic-0001-sample", ".ignored"), { recursive: true });
  await writeFile(path.join(root, "specs", ".hidden", "feature-0001-hidden.md"), "# Hidden\n");
  await writeFile(path.join(root, "specs", "node_modules", "feature-0002-package.md"), "# Package\n");
  await writeFile(path.join(root, "specs", "epic-0001-sample", "epic.md"), "# Epic\n");

  const discovery = await discoverRepository(root);

  assert.deepEqual(discovery.discoveredSpecFiles, ["specs/epic-0001-sample/epic.md"]);
  assert.ok(discovery.ignoredEntries.includes("specs/.hidden"));
  assert.ok(discovery.ignoredEntries.includes("specs/node_modules"));
});
