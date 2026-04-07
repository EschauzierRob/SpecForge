#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { ingestRepository, validateRepository } from "./index.ts";

type Writer = (message: string) => void;

function printUsage(writeError: Writer): void {
  writeError("Usage: specforge <ingest|validate> <repoPath> [--json]");
}

function countDiagnostics(
  diagnostics: Array<{ severity: "error" | "warning" | "info" }>,
): Record<string, number> {
  return diagnostics.reduce<Record<string, number>>((counts, diagnostic) => {
    counts[diagnostic.severity] = (counts[diagnostic.severity] ?? 0) + 1;
    return counts;
  }, {});
}

export function formatIngestSummary(result: Awaited<ReturnType<typeof ingestRepository>>): string[] {
  const parserDiagnosticCounts = countDiagnostics(result.diagnostics);
  const compositionDiagnosticCounts = countDiagnostics(result.compositionDiagnostics);

  return [
    `repo root: ${result.discovery.repoRoot}`,
    `spec files: ${result.discovery.specFileCount}`,
    `overlay files: ${result.discovery.overlayFileCount}`,
    `parsed nodes: ${result.canonicalNodes.length}`,
    `composed nodes: ${result.composedNodes.length}`,
    `overlay directory detected: ${result.discovery.hasOverlayDirectory ? "yes" : "no"}`,
    `parser diagnostics: errors=${parserDiagnosticCounts.error ?? 0}, warnings=${parserDiagnosticCounts.warning ?? 0}, info=${parserDiagnosticCounts.info ?? 0}`,
    `composition diagnostics: errors=${compositionDiagnosticCounts.error ?? 0}, warnings=${compositionDiagnosticCounts.warning ?? 0}, info=${compositionDiagnosticCounts.info ?? 0}`,
  ];
}

export function formatValidationSummary(result: Awaited<ReturnType<typeof validateRepository>>): string[] {
  const severityCounts = result.summary.bySeverity;
  const lines = [
    `validation findings: total=${result.summary.total}, errors=${severityCounts.error}, warnings=${severityCounts.warning}, info=${severityCounts.info}`,
  ];

  if (result.findings.length === 0) {
    lines.push("No validation findings.");
    return lines;
  }

  for (const finding of result.findings) {
    const specIdPart = finding.specId ? ` ${finding.specId}` : "";
    lines.push(
      `- [${finding.severity}] ${finding.ruleId}${specIdPart}: ${finding.message} (${finding.sourcePaths.join(", ")})`,
    );
  }

  return lines;
}

export async function runCli(
  args: string[],
  writeOutput: Writer = console.log,
  writeError: Writer = console.error,
): Promise<number> {
  if (args.length === 0 || !["ingest", "validate"].includes(args[0])) {
    printUsage(writeError);
    return 1;
  }

  const command = args[0];
  const repoPathArg = args.find((argument) => !argument.startsWith("--") && argument !== "ingest" && argument !== "validate");
  const emitJson = args.includes("--json");

  if (!repoPathArg) {
    printUsage(writeError);
    return 1;
  }

  if (command === "ingest") {
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

  const result = await validateRepository(path.resolve(repoPathArg));

  if (emitJson) {
    writeOutput(JSON.stringify(result, null, 2));
  } else {
    for (const line of formatValidationSummary(result)) {
      writeOutput(line);
    }
  }

  return result.summary.bySeverity.error > 0 ? 1 : 0;
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  runCli(process.argv.slice(2)).then(
    (exitCode) => {
      process.exitCode = exitCode;
    },
    (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`specforge command failed: ${message}`);
      process.exitCode = 2;
    },
  );
}
