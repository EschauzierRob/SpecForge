#!/usr/bin/env node
import { constants } from "node:fs";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const overlayFilePattern = /\.overlay\.json$/i;
const ignoredDirectoryNames = new Set([".git", "node_modules", "dist"]);
const validCommands = new Set(["parse", "compose", "ingest", "validate"]);
const validAdapters = new Set(["canonical", "bitbetmatic2"]);

function normalizePath(value) {
  return value.replace(/\\/g, "/");
}

async function exists(targetPath) {
  try {
    await access(targetPath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function shouldIgnore(name) {
  return ignoredDirectoryNames.has(name) || name.startsWith(".");
}

function shouldIgnoreOverlay(name) {
  return shouldIgnore(name) || name === "schema";
}

function acceptsSpec(relativePath, adapterProfile) {
  const fileName = path.basename(relativePath);
  if (adapterProfile === "canonical") {
    return fileName.toLowerCase().endsWith(".md");
  }

  if (relativePath.startsWith("specs/templates/")) {
    return false;
  }

  return fileName.toLowerCase().endsWith(".md") ||
    fileName.toLowerCase().endsWith(".markdown") ||
    !fileName.includes(".");
}

async function walkSpecFiles(currentPath, rootPath, adapterProfile, files, adapterIncluded, ignored) {
  const entries = await readdir(currentPath, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name);
    const relativePath = normalizePath(path.relative(rootPath, fullPath));

    if (shouldIgnore(entry.name)) {
      ignored.push(relativePath);
      continue;
    }

    if (entry.isDirectory()) {
      await walkSpecFiles(fullPath, rootPath, adapterProfile, files, adapterIncluded, ignored);
      continue;
    }

    if (!entry.isFile() || !acceptsSpec(relativePath, adapterProfile)) {
      continue;
    }

    files.push(relativePath);
    if (adapterProfile !== "canonical" && !path.basename(relativePath).toLowerCase().endsWith(".md")) {
      adapterIncluded.push(relativePath);
    }
  }
}

async function walkOverlayFiles(currentPath, rootPath, files, ignored) {
  const entries = await readdir(currentPath, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name);
    const relativePath = normalizePath(path.relative(rootPath, fullPath));

    if (shouldIgnoreOverlay(entry.name)) {
      ignored.push(relativePath);
      continue;
    }

    if (entry.isDirectory()) {
      await walkOverlayFiles(fullPath, rootPath, files, ignored);
      continue;
    }

    if (entry.isFile() && overlayFilePattern.test(entry.name)) {
      files.push(relativePath);
    }
  }
}

function parseSections(content) {
  const lines = content.split(/\r?\n/);
  const sections = {};
  let title;
  let current;
  let buffer = [];

  for (const line of lines) {
    const titleMatch = line.match(/^#\s+(.+)$/);
    if (!title && titleMatch) {
      title = titleMatch[1].trim();
      continue;
    }

    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      if (current) {
        sections[current.toLowerCase()] = buffer.join("\n").trim();
      }
      current = sectionMatch[1].trim();
      buffer = [];
      continue;
    }

    if (current) {
      buffer.push(line);
    }
  }

  if (current) {
    sections[current.toLowerCase()] = buffer.join("\n").trim();
  }

  return { title, sections };
}

function parseList(value) {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s+/, "").replace(/^- \[[ xX]\]\s+/, "").trim())
    .filter(Boolean)
    .filter((line) => line.toLowerCase() !== "none");
}

async function parseSpecFile(filePath, repoRoot) {
  const rawContent = await readFile(filePath, "utf8");
  const sourcePath = normalizePath(path.relative(repoRoot, filePath));
  const { title, sections } = parseSections(rawContent);
  const diagnostics = [];
  const id = sections.id?.trim();
  const type = sections.type?.trim().toLowerCase();

  if (!id) {
    diagnostics.push({ severity: "error", code: "missing-id", message: "Spec is missing an ID section.", sourcePath });
  }

  if (!["epic", "feature", "story", "task"].includes(type)) {
    diagnostics.push({ severity: "error", code: "invalid-type", message: "Spec has an invalid or missing Type section.", sourcePath, specId: id });
  }

  if (!id || !["epic", "feature", "story", "task"].includes(type)) {
    return { diagnostics };
  }

  const parent = sections.parent?.trim();
  const node = {
    id,
    type,
    title: title ?? id,
    summary: sections.summary?.trim() ?? "",
    sourcePath,
    parentId: parent && parent.toLowerCase() !== "none" ? parent : undefined,
    childrenIds: [],
    problemContext: sections["problem / context"]?.trim(),
    goals: parseList(sections.goals),
    nonGoals: parseList(sections["non-goals"]),
    requirements: parseList(sections.requirements),
    acceptanceCriteria: parseList(sections["acceptance criteria"]),
    dependencies: parseList(sections.dependencies),
    openQuestions: parseList(sections["open questions"]),
    notes: sections.notes?.trim(),
  };

  return { node, diagnostics };
}

async function discoverRepository(repoPath, adapterProfile) {
  const repoRoot = path.resolve(repoPath);
  await access(repoRoot, constants.R_OK);
  const specsPath = path.join(repoRoot, "specs");
  const overlayPath = path.join(repoRoot, "specforge", "overlay");
  const missingExpectedDirectories = [];

  if (!await exists(specsPath)) {
    throw new Error("Missing expected directory: specs");
  }

  const hasOverlayDirectory = await exists(overlayPath);
  if (!hasOverlayDirectory) {
    missingExpectedDirectories.push("specforge/overlay");
  }

  const discoveredSpecFiles = [];
  const adapterIncludedSpecFiles = [];
  const discoveredOverlayFiles = [];
  const ignoredEntries = [];
  await walkSpecFiles(specsPath, repoRoot, adapterProfile, discoveredSpecFiles, adapterIncludedSpecFiles, ignoredEntries);

  if (hasOverlayDirectory) {
    await walkOverlayFiles(overlayPath, repoRoot, discoveredOverlayFiles, ignoredEntries);
  }

  discoveredSpecFiles.sort((left, right) => left.localeCompare(right));
  adapterIncludedSpecFiles.sort((left, right) => left.localeCompare(right));
  discoveredOverlayFiles.sort((left, right) => left.localeCompare(right));
  ignoredEntries.sort((left, right) => left.localeCompare(right));

  return {
    repoRoot,
    specsPath: "specs",
    overlayPath: "specforge/overlay",
    cliTooling: {
      status: "available",
      launchers: ["specforge/bin/specforge.ps1", "specforge/bin/specforge.cmd", "specforge/bin/specforge"],
      runtimePath: "specforge/tools/specforge-cli.mjs",
      manifestPath: "specforge/tools/specforge-cli.manifest.json",
      version: "0.1.0",
    },
    specDiscoveryProfile: adapterProfile,
    validationProfile: adapterProfile,
    hasOverlayDirectory,
    discoveredSpecFiles,
    adapterIncludedSpecFiles,
    discoveredOverlayFiles,
    specFileCount: discoveredSpecFiles.length,
    overlayFileCount: discoveredOverlayFiles.length,
    ignoredEntries,
    missingExpectedDirectories,
    bootstrap: { actions: [], createdCount: 0 },
  };
}

async function parseRepository(repoPath, adapterProfile) {
  const discovery = await discoverRepository(repoPath, adapterProfile);
  const parsed = await Promise.all(
    discovery.discoveredSpecFiles.map((relativePath) => parseSpecFile(path.join(discovery.repoRoot, relativePath), discovery.repoRoot)),
  );
  const canonicalNodes = parsed.flatMap((result) => result.node ? [result.node] : []);
  const diagnostics = parsed.flatMap((result) => result.diagnostics);
  const byId = new Map(canonicalNodes.map((node) => [node.id, node]));

  for (const node of canonicalNodes) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId).childrenIds.push(node.id);
    }
  }

  for (const node of canonicalNodes) {
    node.childrenIds.sort((left, right) => left.localeCompare(right));
  }

  return { discovery, canonicalNodes, diagnostics };
}

async function loadOverlayFile(filePath, repoRoot) {
  const payload = JSON.parse(await readFile(filePath, "utf8"));
  return {
    sourcePath: normalizePath(path.relative(repoRoot, filePath)),
    version: String(payload.version ?? ""),
    repositoryId: String(payload.repositoryId ?? ""),
    entries: Array.isArray(payload.entries) ? payload.entries : [],
  };
}

async function composeRepository(repoPath, adapterProfile) {
  const parseResult = await parseRepository(repoPath, adapterProfile);
  const overlayFiles = await Promise.all(
    parseResult.discovery.discoveredOverlayFiles.map((relativePath) => loadOverlayFile(path.join(parseResult.discovery.repoRoot, relativePath), parseResult.discovery.repoRoot)),
  );
  const overlayIndex = new Map();

  for (const overlayFile of overlayFiles) {
    for (const entry of overlayFile.entries) {
      if (entry?.specId) {
        overlayIndex.set(entry.specId, { ...entry, sourcePath: overlayFile.sourcePath, repositoryId: overlayFile.repositoryId });
      }
    }
  }

  return {
    ...parseResult,
    overlayFiles,
    composedNodes: parseResult.canonicalNodes.map((spec) => ({ spec, overlay: overlayIndex.get(spec.id) })),
    compositionDiagnostics: [],
  };
}

function validateResult(composeResult) {
  const findings = [];
  const seenIds = new Set();

  for (const node of composeResult.canonicalNodes) {
    if (seenIds.has(node.id)) {
      findings.push({
        ruleId: "duplicate-spec-id",
        severity: "error",
        message: "Spec ID is duplicated.",
        sourcePaths: [node.sourcePath],
        specId: node.id,
      });
    }
    seenIds.add(node.id);

    if (node.parentId && !composeResult.canonicalNodes.some((candidate) => candidate.id === node.parentId)) {
      findings.push({
        ruleId: "missing-parent",
        severity: "error",
        message: "Spec parent does not resolve to a discovered spec.",
        sourcePaths: [node.sourcePath],
        specId: node.id,
      });
    }
  }

  const bySeverity = { error: 0, warning: 0, info: 0 };
  const byRuleId = {};
  for (const finding of findings) {
    bySeverity[finding.severity] += 1;
    byRuleId[finding.ruleId] = (byRuleId[finding.ruleId] ?? 0) + 1;
  }

  return {
    findings,
    summary: { total: findings.length, bySeverity, byRuleId },
    bootstrap: composeResult.discovery.bootstrap,
  };
}

function printUsage() {
  console.error("Usage: specforge <parse|compose|ingest|validate> <repoPath> [--json] [--output <path>] [--adapter <canonical|bitbetmatic2>]");
}

function readOptions(args) {
  const command = args[0];
  const outputFlagIndex = args.indexOf("--output");
  const adapterFlagIndex = args.indexOf("--adapter");
  const outputPath = outputFlagIndex >= 0 ? args[outputFlagIndex + 1] : undefined;
  const adapterProfile = adapterFlagIndex >= 0 ? args[adapterFlagIndex + 1] : "canonical";
  const repoPath = args.find((argument, index) =>
    !argument.startsWith("--") &&
    argument !== command &&
    (outputFlagIndex < 0 || index !== outputFlagIndex + 1) &&
    (adapterFlagIndex < 0 || index !== adapterFlagIndex + 1)
  );

  if (!validCommands.has(command) || !repoPath || (outputFlagIndex >= 0 && !outputPath) || !validAdapters.has(adapterProfile)) {
    return;
  }

  return { command, repoPath, outputPath, adapterProfile, emitJson: args.includes("--json") };
}

function diagnosticCounts(diagnostics) {
  return diagnostics.reduce((counts, diagnostic) => {
    counts[diagnostic.severity] = (counts[diagnostic.severity] ?? 0) + 1;
    return counts;
  }, {});
}

function parseSummary(result) {
  const counts = diagnosticCounts(result.diagnostics);
  return [
    `repo root: ${result.discovery.repoRoot}`,
    `spec files: ${result.discovery.specFileCount}`,
    `parsed nodes: ${result.canonicalNodes.length}`,
    `overlay directory detected: ${result.discovery.hasOverlayDirectory ? "yes" : "no"}`,
    `specforge cli tooling: ${result.discovery.cliTooling.status}`,
    `parser diagnostics: errors=${counts.error ?? 0}, warnings=${counts.warning ?? 0}, info=${counts.info ?? 0}`,
  ];
}

function composeSummary(result) {
  const parserCounts = diagnosticCounts(result.diagnostics);
  const compositionCounts = diagnosticCounts(result.compositionDiagnostics);
  return [
    `repo root: ${result.discovery.repoRoot}`,
    `spec files: ${result.discovery.specFileCount}`,
    `overlay files: ${result.discovery.overlayFileCount}`,
    `parsed nodes: ${result.canonicalNodes.length}`,
    `composed nodes: ${result.composedNodes.length}`,
    `overlay directory detected: ${result.discovery.hasOverlayDirectory ? "yes" : "no"}`,
    `specforge cli tooling: ${result.discovery.cliTooling.status}`,
    `parser diagnostics: errors=${parserCounts.error ?? 0}, warnings=${parserCounts.warning ?? 0}, info=${parserCounts.info ?? 0}`,
    `composition diagnostics: errors=${compositionCounts.error ?? 0}, warnings=${compositionCounts.warning ?? 0}, info=${compositionCounts.info ?? 0}`,
  ];
}

function validationSummary(result) {
  const severityCounts = result.summary.bySeverity;
  const lines = [
    `validation findings: total=${result.summary.total}, errors=${severityCounts.error}, warnings=${severityCounts.warning}, info=${severityCounts.info}`,
  ];

  if (result.findings.length === 0) {
    lines.push("No validation findings.");
  }

  for (const finding of result.findings) {
    const specIdPart = finding.specId ? ` ${finding.specId}` : "";
    lines.push(`- [${finding.severity}] ${finding.ruleId}${specIdPart}: ${finding.message} (${finding.sourcePaths.join(", ")})`);
  }

  return lines;
}

async function writeJsonArtifact(outputPath, payload) {
  const resolvedPath = path.resolve(outputPath);
  await mkdir(path.dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function main() {
  const options = readOptions(process.argv.slice(2));
  if (!options) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = options.command === "parse"
    ? await parseRepository(options.repoPath, options.adapterProfile)
    : options.command === "validate"
      ? validateResult(await composeRepository(options.repoPath, options.adapterProfile))
      : await composeRepository(options.repoPath, options.adapterProfile);

  if (options.outputPath) {
    await writeJsonArtifact(options.outputPath, result);
  }

  if (options.emitJson) {
    console.log(JSON.stringify(result, null, 2));
  } else if (options.command === "parse") {
    console.log(parseSummary(result).join("\n"));
  } else if (options.command === "validate") {
    console.log(validationSummary(result).join("\n"));
  } else {
    console.log(composeSummary(result).join("\n"));
  }

  if (options.command === "validate" && result.summary.bySeverity.error > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`specforge command failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 2;
});
