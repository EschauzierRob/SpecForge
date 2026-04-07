#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  composeRepository,
  ingestRepository,
  parseRepository,
  validateRepository,
} from "./index.ts";

type Writer = (message: string) => void;

function printUsage(writeError: Writer): void {
  writeError("Usage: specforge <parse|compose|ingest|validate> <repoPath> [--json] [--output <path>]");
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

export function formatParseSummary(result: Awaited<ReturnType<typeof parseRepository>>): string[] {
  const parserDiagnosticCounts = countDiagnostics(result.diagnostics);

  return [
    `repo root: ${result.discovery.repoRoot}`,
    `spec files: ${result.discovery.specFileCount}`,
    `parsed nodes: ${result.canonicalNodes.length}`,
    `overlay directory detected: ${result.discovery.hasOverlayDirectory ? "yes" : "no"}`,
    `parser diagnostics: errors=${parserDiagnosticCounts.error ?? 0}, warnings=${parserDiagnosticCounts.warning ?? 0}, info=${parserDiagnosticCounts.info ?? 0}`,
  ];
}

export function formatComposeSummary(result: Awaited<ReturnType<typeof composeRepository>>): string[] {
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

async function writeJsonArtifact(outputPath: string, payload: unknown): Promise<void> {
  const resolvedPath = path.resolve(outputPath);
  await mkdir(path.dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export async function runCli(
  args: string[],
  writeOutput: Writer = console.log,
  writeError: Writer = console.error,
): Promise<number> {
  if (args.length === 0 || !["parse", "compose", "ingest", "validate"].includes(args[0])) {
    printUsage(writeError);
    return 1;
  }

  const command = args[0];
  const outputFlagIndex = args.indexOf("--output");
  const outputPathArg = outputFlagIndex >= 0 ? args[outputFlagIndex + 1] : undefined;
  if (outputFlagIndex >= 0 && (!outputPathArg || outputPathArg.startsWith("--"))) {
    printUsage(writeError);
    return 1;
  }

  const repoPathArg = args.find(
    (argument, index) =>
      !argument.startsWith("--") &&
      argument !== "parse" &&
      argument !== "compose" &&
      argument !== "ingest" &&
      argument !== "validate" &&
      (outputFlagIndex < 0 || index !== outputFlagIndex + 1),
  );
  const emitJson = args.includes("--json");

  if (!repoPathArg) {
    printUsage(writeError);
    return 1;
  }

  if (command === "parse") {
    const result = await parseRepository(path.resolve(repoPathArg));

    if (outputPathArg) {
      await writeJsonArtifact(outputPathArg, result);
    }

    if (emitJson) {
      writeOutput(JSON.stringify(result, null, 2));
      return 0;
    }

    for (const line of formatParseSummary(result)) {
      writeOutput(line);
    }

    return 0;
  }

  if (command === "compose" || command === "ingest") {
    const result = command === "compose"
      ? await composeRepository(path.resolve(repoPathArg))
      : await ingestRepository(path.resolve(repoPathArg));

    if (outputPathArg) {
      await writeJsonArtifact(outputPathArg, result);
    }

    if (emitJson) {
      writeOutput(JSON.stringify(result, null, 2));
      return 0;
    }

    const summaryLines = command === "compose" ? formatComposeSummary(result) : formatIngestSummary(result);
    for (const line of summaryLines) {
      writeOutput(line);
    }

    return 0;
  }

  const result = await validateRepository(path.resolve(repoPathArg));

  if (outputPathArg) {
    await writeJsonArtifact(outputPathArg, result);
  }

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
