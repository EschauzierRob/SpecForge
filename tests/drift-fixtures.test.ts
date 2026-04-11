import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { ingestRepository } from "../src/index.ts";
import {
  createDriftFixtureRepository,
  driftFixtureDefinitions,
  type DriftFixtureName,
} from "./fixtures/drifted-repositories.ts";

const fixtureNames = Object.keys(driftFixtureDefinitions) as DriftFixtureName[];

for (const fixtureName of fixtureNames) {
  test(`drift fixture ${fixtureName} produces deterministic inference metadata without source mutation`, async () => {
    const fixture = await createDriftFixtureRepository(fixtureName);
    const before = new Map(
      await Promise.all(
        fixture.sourcePaths.map(async (sourcePath) => [
          sourcePath,
          await readFile(path.join(fixture.root, sourcePath), "utf8"),
        ] as const),
      ),
    );

    const result = await ingestRepository(fixture.root);

    for (const sourcePath of fixture.sourcePaths) {
      assert.equal(await readFile(path.join(fixture.root, sourcePath), "utf8"), before.get(sourcePath));
    }

    for (const [specId, expectedParentId] of Object.entries(fixture.expectedParentIds)) {
      const node = result.canonicalNodes.find((candidate) => candidate.id === specId);
      assert.equal(node?.parentId, expectedParentId, `${fixtureName} parent mismatch for ${specId}`);
    }

    for (const [specId, expectedChildrenIds] of Object.entries(fixture.expectedChildrenIds ?? {})) {
      const node = result.canonicalNodes.find((candidate) => candidate.id === specId);
      assert.deepEqual(node?.childrenIds, expectedChildrenIds, `${fixtureName} children mismatch for ${specId}`);
    }

    for (const expectedRelationship of fixture.expectedRelationships) {
      const relationship = result.inference?.relationships.find(
        (candidate) => candidate.childId === expectedRelationship.childId,
      );
      assert.ok(relationship, `${fixtureName} missing relationship for ${expectedRelationship.childId}`);
      assert.equal(relationship.state, expectedRelationship.state);
      assert.equal(relationship.selectedParentId, expectedRelationship.selectedParentId);

      if (expectedRelationship.candidateParentIds) {
        assert.deepEqual(
          relationship.candidates.map((candidate) => candidate.parentId).sort((left, right) => left.localeCompare(right)),
          expectedRelationship.candidateParentIds,
        );
      }

      assert.ok(
        relationship.candidates.every((candidate) => Array.isArray(candidate.evidence)),
        `${fixtureName} candidates should expose evidence arrays`,
      );
    }
  });
}
