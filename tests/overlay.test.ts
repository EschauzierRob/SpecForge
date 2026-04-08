import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  buildOverlayIndex,
  composeNodes,
  discoverOverlayFiles,
  loadOverlayFile,
} from "../src/index.ts";

async function createTempRepo(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "specforge-overlay-"));
  await mkdir(path.join(root, "specforge", "overlay"), { recursive: true });
  return root;
}

test("discoverOverlayFiles finds overlay payloads recursively and ignores schema and hidden paths", async () => {
  const root = await createTempRepo();
  await mkdir(path.join(root, "specforge", "overlay", "examples"), { recursive: true });
  await mkdir(path.join(root, "specforge", "overlay", "schema"), { recursive: true });
  await mkdir(path.join(root, "specforge", "overlay", ".hidden"), { recursive: true });
  await mkdir(path.join(root, "specforge", "overlay", "node_modules"), { recursive: true });
  await writeFile(
    path.join(root, "specforge", "overlay", "local-dev.overlay.json"),
    JSON.stringify({ version: "0.1", repositoryId: "temp", entries: [] }),
  );
  await writeFile(
    path.join(root, "specforge", "overlay", "examples", "team.overlay.json"),
    JSON.stringify({ version: "0.1", repositoryId: "temp", entries: [] }),
  );
  await writeFile(
    path.join(root, "specforge", "overlay", "schema", "ignore.overlay.json"),
    JSON.stringify({ version: "0.1", repositoryId: "temp", entries: [] }),
  );
  await writeFile(
    path.join(root, "specforge", "overlay", ".hidden", "ignore.overlay.json"),
    JSON.stringify({ version: "0.1", repositoryId: "temp", entries: [] }),
  );
  await writeFile(
    path.join(root, "specforge", "overlay", "node_modules", "ignore.overlay.json"),
    JSON.stringify({ version: "0.1", repositoryId: "temp", entries: [] }),
  );

  const files = await discoverOverlayFiles(root);

  assert.deepEqual(files, [
    "specforge/overlay/examples/team.overlay.json",
    "specforge/overlay/local-dev.overlay.json",
  ]);
});

test("loadOverlayFile parses a valid overlay file", async () => {
  const root = await createTempRepo();
  const filePath = path.join(root, "specforge", "overlay", "local-dev.overlay.json");
  await writeFile(
    filePath,
    JSON.stringify({
      version: "0.1",
      repositoryId: "specforge-local",
      entries: [
        {
          specId: "F-0005",
          planningStatus: "ready",
          rank: 10,
          blocked: false,
          dependencies: ["F-0004"],
          notes: "Parser first",
          tags: ["mvp"],
        },
      ],
    }),
  );

  const result = await loadOverlayFile(filePath, root);

  assert.equal(result.overlayFile?.sourcePath, "specforge/overlay/local-dev.overlay.json");
  assert.equal(result.overlayFile?.entries.length, 1);
  assert.equal(result.overlayFile?.entries[0]?.planningStatus, "ready");
  assert.deepEqual(result.diagnostics, []);
});

test("loadOverlayFile reports malformed JSON and invalid file shapes", async () => {
  const root = await createTempRepo();
  const malformedPath = path.join(root, "specforge", "overlay", "malformed.overlay.json");
  const invalidShapePath = path.join(root, "specforge", "overlay", "invalid.overlay.json");
  await writeFile(malformedPath, "{");
  await writeFile(
    invalidShapePath,
    JSON.stringify({
      version: "0.1",
      repositoryId: "temp",
    }),
  );

  const malformed = await loadOverlayFile(malformedPath, root);
  const invalidShape = await loadOverlayFile(invalidShapePath, root);

  assert.equal(malformed.overlayFile, undefined);
  assert.equal(malformed.diagnostics[0]?.code, "invalid-overlay-json");
  assert.equal(invalidShape.overlayFile, undefined);
  assert.ok(invalidShape.diagnostics.some((diagnostic) => diagnostic.code === "invalid-overlay-file"));
});

test("loadOverlayFile reports invalid entry fields without aborting the whole file", async () => {
  const root = await createTempRepo();
  const filePath = path.join(root, "specforge", "overlay", "local-dev.overlay.json");
  await writeFile(
    filePath,
    JSON.stringify({
      version: "0.1",
      repositoryId: "specforge-local",
      entries: [
        {
          specId: "F-0005",
          planningStatus: "ready",
        },
        {
          specId: "F-9999",
          planningStatus: "soon",
        },
      ],
    }),
  );

  const result = await loadOverlayFile(filePath, root);

  assert.equal(result.overlayFile?.entries.length, 1);
  assert.equal(result.overlayFile?.entries[0]?.specId, "F-0005");
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === "invalid-overlay-entry"));
});

test("loadOverlayFile validates blockedReason when present", async () => {
  const root = await createTempRepo();
  const filePath = path.join(root, "specforge", "overlay", "local-dev.overlay.json");
  await writeFile(
    filePath,
    JSON.stringify({
      version: "0.1",
      repositoryId: "specforge-local",
      entries: [
        {
          specId: "F-0005",
          blocked: true,
          blockedReason: "Waiting on API contract sign-off",
        },
        {
          specId: "F-0006",
          blocked: true,
          blockedReason: "   ",
        },
      ],
    }),
  );

  const result = await loadOverlayFile(filePath, root);

  assert.equal(result.overlayFile?.entries.length, 1);
  assert.equal(result.overlayFile?.entries[0]?.blockedReason, "Waiting on API contract sign-off");
  assert.ok(
    result.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "invalid-overlay-entry" && diagnostic.sectionName === "blockedReason",
    ),
  );
});

test("buildOverlayIndex uses first-wins and emits duplicate diagnostics", () => {
  const first = {
    sourcePath: "specforge/overlay/a.overlay.json",
    version: "0.1",
    repositoryId: "repo-a",
    entries: [{ specId: "F-0005", planningStatus: "ready" as const }],
  };
  const second = {
    sourcePath: "specforge/overlay/b.overlay.json",
    version: "0.1",
    repositoryId: "repo-b",
    entries: [{ specId: "F-0005", planningStatus: "blocked" as const }],
  };

  const result = buildOverlayIndex([second, first]);

  assert.equal(result.index.get("F-0005")?.planningStatus, "ready");
  assert.equal(result.index.get("F-0005")?.sourcePath, "specforge/overlay/a.overlay.json");
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === "duplicate-overlay-entry"));
});

test("composeNodes attaches overlay facets and warns about unknown specIds", () => {
  const overlayIndex = new Map([
    [
      "F-0005",
      {
        specId: "F-0005",
        planningStatus: "ready" as const,
        sourcePath: "specforge/overlay/local-dev.overlay.json",
        repositoryId: "specforge-local",
      },
    ],
    [
      "F-9999",
      {
        specId: "F-9999",
        blocked: true,
        sourcePath: "specforge/overlay/local-dev.overlay.json",
        repositoryId: "specforge-local",
      },
    ],
  ]);

  const result = composeNodes(
    [
      {
        id: "F-0005",
        type: "feature",
        title: "Parser",
        summary: "Parser feature",
        sourcePath: "specs/feature.md",
        parentId: "E-0002",
        childrenIds: [],
      },
    ],
    overlayIndex,
  );

  assert.equal(result.composedNodes[0]?.overlay?.planningStatus, "ready");
  assert.equal(result.composedNodes[0]?.overlay?.sourcePath, "specforge/overlay/local-dev.overlay.json");
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === "unknown-overlay-specid"));
});
