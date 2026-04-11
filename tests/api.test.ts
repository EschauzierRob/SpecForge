import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";
import { fileURLToPath } from "node:url";

import {
  composeRepository,
  parseRepository,
  rankRecommendedNextWork,
  startSpecForgeApiServer,
  validateRepository,
} from "../src/index.ts";
import { createDriftFixtureRepository } from "./fixtures/drifted-repositories.ts";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDirectory, "..");

async function createBootstrapCandidate(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "specforge-bootstrap-api-"));
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

async function withApiServer(t: TestContext) {
  const handle = await startSpecForgeApiServer({
    host: "127.0.0.1",
    port: 0,
    defaultRepoPath: repoRoot,
  });

  t.after(async () => {
    await handle.close();
  });

  return handle;
}

test("API context endpoint returns the default repo path", async (t) => {
  const handle = await withApiServer(t);
  const response = await fetch(`${handle.url}/api/context`);

  assert.equal(response.status, 200);

  const payload = await response.json() as { defaultRepoPath: string };
  assert.equal(payload.defaultRepoPath, repoRoot);
});

test("API parse endpoint returns the parse payload shape", async (t) => {
  const handle = await withApiServer(t);
  const directResult = await parseRepository(repoRoot);

  const response = await fetch(`${handle.url}/api/parse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ repoPath: repoRoot }),
  });

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.discovery.repoRoot, directResult.discovery.repoRoot);
  assert.equal(payload.canonicalNodes.length, directResult.canonicalNodes.length);
  assert.equal(payload.diagnostics.length, directResult.diagnostics.length);
});

test("API compose endpoint returns the compose payload shape", async (t) => {
  const handle = await withApiServer(t);
  const directResult = await composeRepository(repoRoot);

  const response = await fetch(`${handle.url}/api/compose`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ repoPath: repoRoot }),
  });

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.discovery.repoRoot, directResult.discovery.repoRoot);
  assert.equal(payload.overlayFiles.length, directResult.overlayFiles.length);
  assert.equal(payload.composedNodes.length, directResult.composedNodes.length);
  assert.equal(payload.compositionDiagnostics.length, directResult.compositionDiagnostics.length);
});

test("API validate endpoint returns the validation payload shape", async (t) => {
  const handle = await withApiServer(t);
  const directResult = await validateRepository(repoRoot);

  const response = await fetch(`${handle.url}/api/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ repoPath: repoRoot }),
  });

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.summary.total, directResult.summary.total);
  assert.equal(payload.summary.bySeverity.error, directResult.summary.bySeverity.error);
  assert.equal(payload.findings.length, directResult.findings.length);
});

test("API recommend endpoint returns recommendation payload shape", async (t) => {
  const handle = await withApiServer(t);
  const composeResult = await composeRepository(repoRoot);
  const validationResult = await validateRepository(repoRoot);
  const directResult = rankRecommendedNextWork(composeResult.composedNodes, validationResult.findings);

  const response = await fetch(`${handle.url}/api/recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ repoPath: repoRoot }),
  });

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.recommendations.length, directResult.recommendations.length);
  assert.equal(payload.evaluations.length, directResult.evaluations.length);
});

test("API returns a structured error for an invalid repo path", async (t) => {
  const handle = await withApiServer(t);

  const response = await fetch(`${handle.url}/api/compose`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ repoPath: path.join(repoRoot, "does-not-exist") }),
  });

  assert.equal(response.status, 400);

  const payload = await response.json() as {
    error: {
      code: string;
      message: string;
      status: number;
    };
  };

  assert.equal(payload.error.status, 400);
  assert.equal(payload.error.code, "invalid-repository");
  assert.match(payload.error.message, /repo|specs|ENOENT/i);
});

test("API compose endpoint exposes bootstrap actions for partially initialized repositories", async (t) => {
  const handle = await withApiServer(t);
  const bootstrapRepoRoot = await createBootstrapCandidate();

  const response = await fetch(`${handle.url}/api/compose`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ repoPath: bootstrapRepoRoot }),
  });

  assert.equal(response.status, 200);

  const payload = await response.json() as {
    discovery: {
      bootstrap: {
        createdCount: number;
        actions: Array<{ kind: string; path: string }>;
      };
    };
  };

  assert.equal(payload.discovery.bootstrap.createdCount, 7);
  assert.deepEqual(payload.discovery.bootstrap.actions, [
    { kind: "directory", path: "specforge" },
    { kind: "directory", path: "specforge/overlay" },
    { kind: "file", path: "specforge/README.md" },
    { kind: "file", path: "specforge/overlay/README.md" },
    { kind: "file", path: "specforge/overlay/local-dev.overlay.json" },
    { kind: "file", path: "specforge/ai-coder-instructions.md" },
    { kind: "file", path: "AGENTS.md" },
  ]);
});

test("API parse and compose endpoints expose inference metadata for drifted repositories", async (t) => {
  const handle = await withApiServer(t);
  const fixture = await createDriftFixtureRepository("missing-parent");

  const parseResponse = await fetch(`${handle.url}/api/parse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ repoPath: fixture.root }),
  });
  const composeResponse = await fetch(`${handle.url}/api/compose`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ repoPath: fixture.root }),
  });

  assert.equal(parseResponse.status, 200);
  assert.equal(composeResponse.status, 200);

  const parsePayload = await parseResponse.json();
  const composePayload = await composeResponse.json();

  assert.equal(parsePayload.inference?.relationships[0]?.childId, "S-0001");
  assert.equal(parsePayload.inference?.relationships[0]?.selectedParentId, "F-0001");
  assert.equal(composePayload.inference?.relationships[0]?.childId, "S-0001");
  assert.equal(composePayload.inference?.relationships[0]?.selectedParentId, "F-0001");
});

test("API parse endpoint accepts adapterProfile option", async (t) => {
  const handle = await withApiServer(t);
  const root = await mkdtemp(path.join(os.tmpdir(), "specforge-api-adapter-"));
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
Loaded through API adapter option.
`,
  );

  const response = await fetch(`${handle.url}/api/parse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ repoPath: root, adapterProfile: "bitbetmatic2" }),
  });

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.discovery.specDiscoveryProfile, "bitbetmatic2");
  assert.equal(payload.canonicalNodes[0]?.id, "E-0001");
});
