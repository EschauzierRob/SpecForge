import assert from "node:assert/strict";
import path from "node:path";
import test, { type TestContext } from "node:test";
import { fileURLToPath } from "node:url";

import {
  composeRepository,
  parseRepository,
  recommendRepository,
  startSpecForgeApiServer,
  validateRepository,
} from "../src/index.ts";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDirectory, "..");

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

test("API recommend endpoint returns the recommendation payload shape", async (t) => {
  const handle = await withApiServer(t);
  const directResult = await recommendRepository(repoRoot);

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
  assert.equal(payload.excluded.done.length, directResult.excluded.done.length);
  assert.equal(payload.excluded.blocked.length, directResult.excluded.blocked.length);
  assert.equal(payload.excluded.unresolvedDependencies.length, directResult.excluded.unresolvedDependencies.length);
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
