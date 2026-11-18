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
      version: "0.2.1",
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

const { loadOverlayFile } = (() => {
const validPlanningStatuses = new Set                ([
  "backlog",
  "ready",
  "in_progress",
  "blocked",
  "done",
]);
const validWorkTypes = new Set(["research", "design", "implementation", "validation", "documentation"]);
const validEvidenceAssessments = new Set(["passed", "failed"]);
const validSliceResolutions = new Set(["validated", "disproved", "killed"]);
const validBlockerStatuses = new Set(["open", "resolved"]);

const overlayEntryKeys = new Set([
  "specId",
  "planningStatus",
  "rank",
  "blocked",
  "blockedReason",
  "dependencies",
  "notes",
  "tags",
]);

function isRecord(value         )                                   {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toSourcePath(filePath        , repoRoot        )         {
  return path.relative(repoRoot, filePath).replace(/\\/g, "/");
}

function createDiagnostic(
  diagnostic                                           ,
  sourcePath        ,
)                        {
  return {
    sourcePath,
    ...diagnostic,
  };
}

function isValidSpecId(value        )          {
  return /^[EFST]-\d{4}$/.test(value);
}

function hasUniqueStrings(values          )          {
  return new Set(values).size === values.length;
}

function hasOnlyKeys(value                         , keys          )          {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isNonEmptyString(value         )                  {
  return typeof value === "string" && value.trim().length > 0;
}

function isUniqueNonEmptyStringArray(value         )                    {
  return validateStringArray(value, (item) => item.trim().length > 0) && hasUniqueStrings(value);
}

function isIdentifier(value         , pattern        )                  {
  return typeof value === "string" && pattern.test(value);
}

function validateCriterion(value         , prefix             )                          {
  if (!isRecord(value) || !hasOnlyKeys(value, ["criterionId", "description", "met", "evidenceIds"])) {
    return false;
  }

  return isIdentifier(value.criterionId, new RegExp(`^${prefix}-\\d{3}$`))
    && isNonEmptyString(value.description)
    && typeof value.met === "boolean"
    && (value.evidenceIds === undefined
      || (isUniqueNonEmptyStringArray(value.evidenceIds)
        && value.evidenceIds.every((id) => /^OE-\d{3}$/.test(id))));
}

function validateWorkItem(value         )                             {
  if (!isRecord(value) || !hasOnlyKeys(value, ["workId", "specId", "type", "description"])) {
    return false;
  }

  return isIdentifier(value.workId, /^PW-\d{3}$/)
    && isNonEmptyString(value.specId)
    && isValidSpecId(value.specId)
    && typeof value.type === "string"
    && validWorkTypes.has(value.type)
    && isNonEmptyString(value.description);
}

function validateRequiredEvidence(value         )                            {
  return isRecord(value)
    && hasOnlyKeys(value, ["evidenceId", "description"])
    && isIdentifier(value.evidenceId, /^RE-\d{3}$/)
    && isNonEmptyString(value.description);
}

function validateProvenance(value         )                                      {
  return isRecord(value)
    && hasOnlyKeys(value, ["repository", "commit", "branch", "artifactPath", "observedAt", "consumerVerified"])
    && isNonEmptyString(value.repository)
    && isNonEmptyString(value.commit)
    && /^[0-9a-f]{7,64}$/i.test(value.commit)
    && (value.branch === undefined || isNonEmptyString(value.branch))
    && isNonEmptyString(value.artifactPath)
    && isNonEmptyString(value.observedAt)
    && !Number.isNaN(Date.parse(value.observedAt))
    && typeof value.consumerVerified === "boolean";
}

function validateObservedEvidence(value         )                            {
  if (
    !isRecord(value)
    || !hasOnlyKeys(value, [
      "evidenceId",
      "description",
      "satisfies",
      "assessment",
      "artifactPath",
      "command",
      "observedAt",
      "provenance",
    ])
  ) {
    return false;
  }

  return isIdentifier(value.evidenceId, /^OE-\d{3}$/)
    && isNonEmptyString(value.description)
    && isUniqueNonEmptyStringArray(value.satisfies)
    && value.satisfies.every((id) => /^RE-\d{3}$/.test(id))
    && typeof value.assessment === "string"
    && validEvidenceAssessments.has(value.assessment)
    && (value.artifactPath === undefined || isNonEmptyString(value.artifactPath))
    && (value.command === undefined || isNonEmptyString(value.command))
    && (value.observedAt === undefined
      || (isNonEmptyString(value.observedAt) && !Number.isNaN(Date.parse(value.observedAt))))
    && (value.provenance === undefined || validateProvenance(value.provenance));
}

function validateDecision(value         )                         {
  return isRecord(value)
    && hasOnlyKeys(value, ["decisionId", "decision", "reason", "decidedAt"])
    && isIdentifier(value.decisionId, /^D-\d{3}$/)
    && isNonEmptyString(value.decision)
    && (value.reason === undefined || isNonEmptyString(value.reason))
    && (value.decidedAt === undefined
      || (isNonEmptyString(value.decidedAt) && !Number.isNaN(Date.parse(value.decidedAt))));
}

function validateBlocker(value         )                        {
  return isRecord(value)
    && hasOnlyKeys(value, ["blockerId", "description", "status"])
    && isIdentifier(value.blockerId, /^B-\d{3}$/)
    && isNonEmptyString(value.description)
    && typeof value.status === "string"
    && validBlockerStatuses.has(value.status);
}

function hasUniqueIds(values                                , key        )          {
  const identifiers = values.map((value) => value[key]);
  return identifiers.every((identifier) => typeof identifier === "string")
    && new Set(identifiers).size === identifiers.length;
}

function validateExecutionSlice(
  value         ,
  sourcePath        ,
  sliceIndex        ,
)                                                                   {
  const fail = (message        )                                           => ({
    diagnostics: [
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-execution-slice",
          message: `Execution slice at index ${sliceIndex} ${message}`,
          sectionName: "executionSlices",
        },
        sourcePath,
      ),
    ],
  });

  const keys = [
    "sliceId", "title", "planningStatus", "resolution", "linkedSpecIds", "objective", "hypothesis",
    "entryCriteria", "scope", "work", "exitCriteria", "requiredEvidence", "observedEvidence",
    "killCriteria", "dependencySliceIds", "decisions", "blockers", "nextAction",
  ];
  if (!isRecord(value) || !hasOnlyKeys(value, keys)) {
    return fail("must be an object containing only supported properties.");
  }

  if (!isIdentifier(value.sliceId, /^SL-\d{4}$/) || !isNonEmptyString(value.title)) {
    return fail("must have a valid sliceId and non-empty title.");
  }
  if (typeof value.planningStatus !== "string" || !validPlanningStatuses.has(value.planningStatus                  )) {
    return fail("has an invalid planningStatus.");
  }
  if (
    value.resolution !== undefined
    && (typeof value.resolution !== "string" || !validSliceResolutions.has(value.resolution))
  ) {
    return fail("has an invalid resolution.");
  }
  if (
    !validateStringArray(value.linkedSpecIds, isValidSpecId)
    || !hasUniqueStrings(value.linkedSpecIds)
    || !isNonEmptyString(value.objective)
    || (value.hypothesis !== undefined && !isNonEmptyString(value.hypothesis))
  ) {
    return fail("has invalid spec links, objective, or hypothesis.");
  }

  if (
    !Array.isArray(value.entryCriteria)
    || !value.entryCriteria.every((criterion) => validateCriterion(criterion, "EC"))
    || !hasUniqueIds(value.entryCriteria, "criterionId")
    || !isRecord(value.scope)
    || !hasOnlyKeys(value.scope, ["included", "excluded"])
    || !isUniqueNonEmptyStringArray(value.scope.included)
    || !isUniqueNonEmptyStringArray(value.scope.excluded)
  ) {
    return fail("has invalid entry criteria or scope.");
  }

  if (
    !Array.isArray(value.work)
    || !value.work.every(validateWorkItem)
    || !hasUniqueIds(value.work, "workId")
    || !Array.isArray(value.exitCriteria)
    || !value.exitCriteria.every((criterion) => validateCriterion(criterion, "XC"))
    || !hasUniqueIds(value.exitCriteria, "criterionId")
  ) {
    return fail("has invalid work or exit criteria.");
  }

  if (
    !Array.isArray(value.requiredEvidence)
    || !value.requiredEvidence.every(validateRequiredEvidence)
    || !hasUniqueIds(value.requiredEvidence, "evidenceId")
    || !Array.isArray(value.observedEvidence)
    || !value.observedEvidence.every(validateObservedEvidence)
    || !hasUniqueIds(value.observedEvidence, "evidenceId")
  ) {
    return fail("has invalid required or observed evidence.");
  }

  if (
    !isUniqueNonEmptyStringArray(value.killCriteria)
    || !validateStringArray(value.dependencySliceIds, (id) => /^SL-\d{4}$/.test(id))
    || !hasUniqueStrings(value.dependencySliceIds)
    || !Array.isArray(value.decisions)
    || !value.decisions.every(validateDecision)
    || !hasUniqueIds(value.decisions, "decisionId")
    || !Array.isArray(value.blockers)
    || !value.blockers.every(validateBlocker)
    || !hasUniqueIds(value.blockers, "blockerId")
    || typeof value.nextAction !== "string"
  ) {
    return fail("has invalid kill criteria, dependencies, decisions, blockers, or next action.");
  }

  return { slice: value                             , diagnostics: [] };
}

function validateStringArray(
  value         ,
  validator                           ,
)                    {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && validator(item));
}

function validateEntry(
  entry         ,
  sourcePath        ,
  entryIndex        ,
)                                                                 {
  const diagnostics                          = [];

  if (!isRecord(entry)) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-entry",
          message: `Overlay entry at index ${entryIndex} must be an object.`,
          sectionName: "entries",
        },
        sourcePath,
      ),
    );
    return { diagnostics };
  }

  const unknownKeys = Object.keys(entry).filter((key) => !overlayEntryKeys.has(key));
  if (unknownKeys.length > 0) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-entry",
          message: `Overlay entry at index ${entryIndex} has unsupported properties: ${unknownKeys.join(", ")}.`,
          sectionName: "entries",
        },
        sourcePath,
      ),
    );
    return { diagnostics };
  }

  const specId = entry.specId;
  if (typeof specId !== "string" || !isValidSpecId(specId)) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-entry",
          message: `Overlay entry at index ${entryIndex} has an invalid specId.`,
          sectionName: "entries",
        },
        sourcePath,
      ),
    );
    return { diagnostics };
  }

  const planningStatus = entry.planningStatus;
  if (planningStatus !== undefined && (typeof planningStatus !== "string" || !validPlanningStatuses.has(planningStatus                  ))) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-entry",
          message: `Overlay entry for ${specId} has an invalid planningStatus.`,
          specId,
          sectionName: "planningStatus",
        },
        sourcePath,
      ),
    );
    return { diagnostics };
  }

  const rank = entry.rank;
  if (rank !== undefined && (!Number.isInteger(rank) || rank < 1)) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-entry",
          message: `Overlay entry for ${specId} has an invalid rank.`,
          specId,
          sectionName: "rank",
        },
        sourcePath,
      ),
    );
    return { diagnostics };
  }

  const blocked = entry.blocked;
  if (blocked !== undefined && typeof blocked !== "boolean") {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-entry",
          message: `Overlay entry for ${specId} has an invalid blocked value.`,
          specId,
          sectionName: "blocked",
        },
        sourcePath,
      ),
    );
    return { diagnostics };
  }

  // Empty form/AI output means no reason when the entry is not blocked.
  const blockedReason = typeof entry.blockedReason === "string"
    && entry.blockedReason.trim().length === 0
    && blocked !== true && planningStatus !== "blocked"
    ? undefined
    : entry.blockedReason;
  if (
    blockedReason !== undefined &&
    (typeof blockedReason !== "string" || blockedReason.trim().length === 0)
  ) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-entry",
          message: `Overlay entry for ${specId} has invalid blockedReason.`,
          specId,
          sectionName: "blockedReason",
        },
        sourcePath,
      ),
    );
    return { diagnostics };
  }

  const dependencies = entry.dependencies;
  if (
    dependencies !== undefined &&
    (!validateStringArray(dependencies, isValidSpecId) || !hasUniqueStrings(dependencies))
  ) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-entry",
          message: `Overlay entry for ${specId} has invalid dependencies.`,
          specId,
          sectionName: "dependencies",
        },
        sourcePath,
      ),
    );
    return { diagnostics };
  }

  const notes = entry.notes;
  if (notes !== undefined && typeof notes !== "string") {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-entry",
          message: `Overlay entry for ${specId} has invalid notes.`,
          specId,
          sectionName: "notes",
        },
        sourcePath,
      ),
    );
    return { diagnostics };
  }

  const tags = entry.tags;
  if (
    tags !== undefined &&
    (!validateStringArray(tags, (item) => item.trim().length > 0) || !hasUniqueStrings(tags))
  ) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-entry",
          message: `Overlay entry for ${specId} has invalid tags.`,
          specId,
          sectionName: "tags",
        },
        sourcePath,
      ),
    );
    return { diagnostics };
  }

  return {
    entry: {
      specId,
      planningStatus: planningStatus                              ,
      rank,
      blocked,
      blockedReason,
      dependencies: dependencies ? [...dependencies] : undefined,
      notes,
      tags: tags ? [...tags] : undefined,
    },
    diagnostics,
  };
}

async function loadOverlayFile(
  filePath        ,
  repoRoot        ,
)                                                                               {
  const sourcePath = toSourcePath(filePath, repoRoot);
  const diagnostics                          = [];

  let rawContent        ;
  try {
    rawContent = await readFile(filePath, "utf8");
  } catch (error         ) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      diagnostics: [
        createDiagnostic(
          {
            severity: "error",
            code: "overlay-read-failed",
            message: `Failed to read overlay file: ${message}`,
          },
          sourcePath,
        ),
      ],
    };
  }

  let parsed         ;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    return {
      diagnostics: [
        createDiagnostic(
          {
            severity: "error",
            code: "invalid-overlay-json",
            message: "Overlay file contains invalid JSON.",
          },
          sourcePath,
        ),
      ],
    };
  }

  if (!isRecord(parsed)) {
    return {
      diagnostics: [
        createDiagnostic(
          {
            severity: "error",
            code: "invalid-overlay-file",
            message: "Overlay file must be a JSON object.",
          },
          sourcePath,
        ),
      ],
    };
  }

  const unknownTopLevelKeys = Object.keys(parsed).filter(
    (key) => !["version", "repositoryId", "entries", "executionSlices"].includes(key),
  );
  if (unknownTopLevelKeys.length > 0) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-file",
          message: `Overlay file has unsupported top-level properties: ${unknownTopLevelKeys.join(", ")}.`,
        },
        sourcePath,
      ),
    );
  }

  const version =
    typeof parsed.version === "string" && parsed.version.trim().length > 0 ? parsed.version : "unknown";
  if (version === "unknown") {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-version",
          message: "Overlay file is missing a valid version; using \"unknown\" in the runtime model.",
          sectionName: "version",
        },
        sourcePath,
      ),
    );
  } else if (version !== "0.1" && version !== "0.2") {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-version",
          message: `Overlay file version ${version} is unsupported; attempting to load compatible fields.`,
          sectionName: "version",
        },
        sourcePath,
      ),
    );
  }

  const repositoryId =
    typeof parsed.repositoryId === "string" && parsed.repositoryId.trim().length > 0
      ? parsed.repositoryId
      : "unknown";
  if (repositoryId === "unknown") {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-repository-id",
          message: "Overlay file is missing a valid repositoryId; using \"unknown\" in the runtime model.",
          sectionName: "repositoryId",
        },
        sourcePath,
      ),
    );
  }

  if (!Array.isArray(parsed.entries)) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "error",
          code: "invalid-overlay-file",
          message: "Overlay file must include an entries array.",
          sectionName: "entries",
        },
        sourcePath,
      ),
    );
    return { diagnostics };
  }

  const entries                 = [];
  for (const [entryIndex, rawEntry] of parsed.entries.entries()) {
    const validated = validateEntry(rawEntry, sourcePath, entryIndex);
    diagnostics.push(...validated.diagnostics);
    if (validated.entry) {
      entries.push(validated.entry);
    }
  }

  if (parsed.executionSlices !== undefined && !Array.isArray(parsed.executionSlices)) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "error",
          code: "invalid-overlay-file",
          message: "Overlay executionSlices must be an array when present.",
          sectionName: "executionSlices",
        },
        sourcePath,
      ),
    );
    return { diagnostics };
  }

  if (version === "0.1" && parsed.executionSlices !== undefined) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-version",
          message: "executionSlices requires overlay version 0.2.",
          sectionName: "version",
        },
        sourcePath,
      ),
    );
  }

  const executionSlices                   = [];
  for (const [sliceIndex, rawSlice] of (parsed.executionSlices ?? []).entries()) {
    const validated = validateExecutionSlice(rawSlice, sourcePath, sliceIndex);
    diagnostics.push(...validated.diagnostics);
    if (validated.slice) {
      executionSlices.push(validated.slice);
    }
  }

  return {
    overlayFile: {
      sourcePath,
      version,
      repositoryId,
      entries,
      executionSlices,
    },
    diagnostics,
  };
}

return { loadOverlayFile };
})();
const { buildOverlayIndex, composeNodes } = (() => {








function createDiagnostic(
  diagnostic                                           ,
  sourcePath        ,
)                        {
  return {
    sourcePath,
    ...diagnostic,
  };
}

function buildOverlayIndex(
  overlayFiles               ,
)                                                                             {
  const index = new Map                      ();
  const diagnostics                          = [];
  const sortedOverlayFiles = [...overlayFiles].sort((left, right) => left.sourcePath.localeCompare(right.sourcePath));

  for (const overlayFile of sortedOverlayFiles) {
    for (const entry of overlayFile.entries) {
      if (index.has(entry.specId)) {
        diagnostics.push(
          createDiagnostic(
            {
              severity: "warning",
              code: "duplicate-overlay-entry",
              message: `Duplicate overlay entry for ${entry.specId} ignored because an earlier overlay file already claimed it.`,
              specId: entry.specId,
            },
            overlayFile.sourcePath,
          ),
        );
        continue;
      }

      index.set(entry.specId, {
        ...entry,
        sourcePath: overlayFile.sourcePath,
        repositoryId: overlayFile.repositoryId,
      });
    }
  }

  return { index, diagnostics };
}

function composeNodes(
  canonicalNodes                 ,
  overlayIndex                           ,
)                                                                          {
  const diagnostics                          = [];
  const canonicalIds = new Set(canonicalNodes.map((node) => node.id));
  const composedNodes = canonicalNodes.map((spec) => ({
    spec,
    overlay: overlayIndex.get(spec.id),
  }));

  for (const [specId, overlay] of overlayIndex.entries()) {
    if (canonicalIds.has(specId)) {
      continue;
    }

    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "unknown-overlay-specid",
          message: `Overlay entry references unknown specId ${specId}.`,
          specId,
        },
        overlay.sourcePath,
      ),
    );
  }

  return { composedNodes, diagnostics };
}

return { buildOverlayIndex, composeNodes };
})();
const { overlayDiagnosticToFinding } = (() => {


function overlayDiagnosticToFinding(diagnostic                       )                                {
  let ruleId        ;
  let severity                                = "error";
  let remediationHint        ;
  if (diagnostic.code === "unknown-overlay-specid") {
    ruleId = "V-101";
    severity = "warning";
    remediationHint = "Update the overlay entry to point at an existing spec ID.";
  } else if (diagnostic.code === "invalid-overlay-entry" && diagnostic.sectionName === "planningStatus") {
    ruleId = "V-102";
    remediationHint = "Use one of the supported planningStatus values.";
  } else if (diagnostic.code === "invalid-overlay-entry" && diagnostic.sectionName === "rank") {
    ruleId = "V-103";
    severity = "warning";
    remediationHint = "Set rank to a positive integer.";
  } else if (diagnostic.code === "invalid-execution-slice") {
    ruleId = "V-200";
    remediationHint = "Repair the execution slice so every field matches the version 0.2 overlay contract.";
  } else if (["invalid-overlay-entry", "invalid-overlay-json", "invalid-overlay-file",
    "invalid-overlay-version", "invalid-overlay-repository-id", "overlay-read-failed"].includes(diagnostic.code)) {
    ruleId = "V-105";
    remediationHint = "Repair the reported overlay field. Omit blockedReason when there is no reason; otherwise use a non-empty string. Rejected entries do not contribute planning metadata.";
  } else {
    return undefined;
  }
  return { ruleId, severity, message: diagnostic.message, specId: diagnostic.specId,
    sourcePaths: [diagnostic.sourcePath], remediationHint };
}

return { overlayDiagnosticToFinding };
})();
async function composeRepository(repoPath, adapterProfile) {
  const parseResult = await parseRepository(repoPath, adapterProfile);
  const loaded = await Promise.all(parseResult.discovery.discoveredOverlayFiles.map(
    (relativePath) => loadOverlayFile(path.join(parseResult.discovery.repoRoot, relativePath), parseResult.discovery.repoRoot)));
  const overlayFiles = loaded.flatMap((result) => result.overlayFile ? [result.overlayFile] : []);
  const index = buildOverlayIndex(overlayFiles);
  const composed = composeNodes(parseResult.canonicalNodes, index.index);
  return { ...parseResult, overlayFiles, composedNodes: composed.composedNodes,
    compositionDiagnostics: loaded.flatMap((result) => result.diagnostics).concat(index.diagnostics, composed.diagnostics) };
}

function validateResult(composeResult) {
  const findings = composeResult.compositionDiagnostics.map(overlayDiagnosticToFinding).filter(Boolean);
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

  const slices = composeResult.overlayFiles.flatMap((overlayFile) => overlayFile.executionSlices ?? []);
  const activeSlices = slices.filter((slice) => slice?.planningStatus === "in_progress" || slice?.planningStatus === "blocked");
  if (activeSlices.length > 1) {
    findings.push({
      ruleId: "V-203",
      severity: "error",
      message: "Low-WIP policy allows one active thematic execution slice.",
      sourcePaths: composeResult.overlayFiles.map((overlayFile) => overlayFile.sourcePath),
    });
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
