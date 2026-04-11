import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export interface RepositoryEdgeFixture {
  root: string;
  files: string[];
}

export async function createRepositoryEdgeFixture(): Promise<RepositoryEdgeFixture> {
  const root = await mkdtemp(path.join(os.tmpdir(), "specforge-repo-edge-"));

  const files: Record<string, string> = {
    "specs/epic-1000-edge-cases/epic.md": `# Edge Cases Epic

## ID
E-1000

## Type
Epic

## Summary
Covers drifted repository artifacts and tolerant parsing scenarios.

## Goals
- Keep ingestion deterministic for non-canonical source shapes.

## Non-goals
- Mutate source files during parse or inference.
`,
    "specs/epic-1000-edge-cases/feature-1001-payment-core.md": `# Feature A - Payment Core

## ID
F-1001

## Type
Feature

## Parent
E-1000

## Summary
Core payment path orchestration.

## Requirements
- R1: Parent and children remain inferable.
`,
    "specs/epic-1000-edge-cases/feature-1002-payment-ledger": `Feature B — Payment Ledger
Story 2.1

This prose-only opening paragraph intentionally carries embedded Feature and Story markers.

## ID
F-1002

## Type
Feature

## Parent
E-1000

## Requirements
- R1: Fallback summary and title should be captured.
`,
    "specs/epic-1000-edge-cases/story-1002-ledger-sync.md": `# Story 2.1 — Ledger Sync

## ID
S-1002

## Type
Story

## Summary
Align the ledger sync flow with F-1002 and Feature B - Payment Ledger.

## D-1002-1
- Decision: Parent should be F-1002 due to ledger ownership.
- Reason: F-1002 owns the payment ledger boundary.

## Acceptance Criteria
- AC1: Story parent is inferred from metadata and content evidence.
`,
    "specs/epic-1000-edge-cases/slice-ledger-observability.md": `# Ledger Observability Slice

Operational sketch and discovery notes for ledger observability roll-out.
`,
    "specs/epic-1000-edge-cases/plan.md": `# Plan - Edge Cases

Narrative-only planning artifact for this epic.
`,
    "specs/epic-2000-incomplete/epic.md": `# Incomplete Epic

## ID
E-2000

## Type
Epic

## Summary
Intentionally lacks plan/tasks/decisions/clarifications artifacts.

## Goals
- Surface informative warnings without parser crashes.

## Non-goals
- Fill missing files automatically.
`,
  };

  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(root, relativePath);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, "utf8");
  }

  return {
    root,
    files: Object.keys(files).sort((left, right) => left.localeCompare(right)),
  };
}
