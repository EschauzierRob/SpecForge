#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { ingestRepository } from "./index.ts";

type Writer = (message: string) => void;

function printUsage(writeError: Writer): void {
  writeError("Usage: specforge ingest <repoPath> [--json]");
}

function countDiagnostics(diagnostics: Awaited<ReturnType<typeof ingestRepository>>["diagnostics"]): Record<string, number> {
  return diagnostics.reduce<Record<string, number>>((counts, diagnostic) => {
    counts[diagnostic.severity] = (counts[diagnostic.severity] ?? 0) + 1;
    return counts;
  }, {});
}

export function formatIngestSummary(result: Awaited<ReturnType<typeof ingestRepository>>): string[] {
  const diagnosticCounts = countDiagnostics(result.diagnostics);

  return [
    `repo root: ${result.discovery.repoRoot}`,
    `spec files: ${result.discovery.specFileCount}`,
    `parsed nodes: ${result.canonicalNodes.length}`,
    `overlay directory detected: ${result.discovery.hasOverlayDirectory ? "yes" : "no"}`,
    `diagnostics: errors=${diagnosticCounts.error ?? 0}, warnings=${diagnosticCounts.warning ?? 0}, info=${diagnosticCounts.info ?? 0}`,
  ];
}

export async function runCli(
  args: string[],
  writeOutput: Writer = console.log,
  writeError: Writer = console.error,
): Promise<number> {
  if (args.length === 0 || args[0] !== "ingest") {
    printUsage(writeError);
    return 1;
  }

  const repoPathArg = args.find((argument) => !argument.startsWith("--") && argument !== "ingest");
  const emitJson = args.includes("--json");

  if (!repoPathArg) {
    printUsage(writeError);
    return 1;
  }

  const result = await ingestRepository(path.resolve(repoPathArg));

  if (emitJson) {
    writeOutput(JSON.stringify(result, null, 2));
    return 0;
  }

  for (const line of formatIngestSummary(result)) {
    writeOutput(line);
  }

  return 0;
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  runCli(process.argv.slice(2)).then(
    (exitCode) => {
      process.exitCode = exitCode;
    },
    (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`specforge ingest failed: ${message}`);
      process.exitCode = 1;
    },
  );
}
