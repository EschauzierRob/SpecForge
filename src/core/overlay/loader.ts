import { readFile } from "node:fs/promises";
import path from "node:path";

import type {
  CompositionDiagnostic,
  ExecutionSlice,
  ExecutionWorkItem,
  ExternalEvidenceProvenance,
  ObservedEvidence,
  OverlayEntry,
  OverlayFile,
  PlanningStatus,
  RequiredEvidence,
  SliceBlocker,
  SliceCriterion,
  SliceDecision,
} from "../model/types.ts";

const validPlanningStatuses = new Set<PlanningStatus>([
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toSourcePath(filePath: string, repoRoot: string): string {
  return path.relative(repoRoot, filePath).replace(/\\/g, "/");
}

function createDiagnostic(
  diagnostic: Omit<CompositionDiagnostic, "sourcePath">,
  sourcePath: string,
): CompositionDiagnostic {
  return {
    sourcePath,
    ...diagnostic,
  };
}

function isValidSpecId(value: string): boolean {
  return /^[EFST]-\d{4}$/.test(value);
}

function hasUniqueStrings(values: string[]): boolean {
  return new Set(values).size === values.length;
}

function hasOnlyKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isUniqueNonEmptyStringArray(value: unknown): value is string[] {
  return validateStringArray(value, (item) => item.trim().length > 0) && hasUniqueStrings(value);
}

function isIdentifier(value: unknown, pattern: RegExp): value is string {
  return typeof value === "string" && pattern.test(value);
}

function validateCriterion(value: unknown, prefix: "EC" | "XC"): value is SliceCriterion {
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

function validateWorkItem(value: unknown): value is ExecutionWorkItem {
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

function validateRequiredEvidence(value: unknown): value is RequiredEvidence {
  return isRecord(value)
    && hasOnlyKeys(value, ["evidenceId", "description"])
    && isIdentifier(value.evidenceId, /^RE-\d{3}$/)
    && isNonEmptyString(value.description);
}

function validateProvenance(value: unknown): value is ExternalEvidenceProvenance {
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

function validateObservedEvidence(value: unknown): value is ObservedEvidence {
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

function validateDecision(value: unknown): value is SliceDecision {
  return isRecord(value)
    && hasOnlyKeys(value, ["decisionId", "decision", "reason", "decidedAt"])
    && isIdentifier(value.decisionId, /^D-\d{3}$/)
    && isNonEmptyString(value.decision)
    && (value.reason === undefined || isNonEmptyString(value.reason))
    && (value.decidedAt === undefined
      || (isNonEmptyString(value.decidedAt) && !Number.isNaN(Date.parse(value.decidedAt))));
}

function validateBlocker(value: unknown): value is SliceBlocker {
  return isRecord(value)
    && hasOnlyKeys(value, ["blockerId", "description", "status"])
    && isIdentifier(value.blockerId, /^B-\d{3}$/)
    && isNonEmptyString(value.description)
    && typeof value.status === "string"
    && validBlockerStatuses.has(value.status);
}

function hasUniqueIds(values: Array<Record<string, unknown>>, key: string): boolean {
  const identifiers = values.map((value) => value[key]);
  return identifiers.every((identifier) => typeof identifier === "string")
    && new Set(identifiers).size === identifiers.length;
}

function validateExecutionSlice(
  value: unknown,
  sourcePath: string,
  sliceIndex: number,
): { slice?: ExecutionSlice; diagnostics: CompositionDiagnostic[] } {
  const fail = (message: string): { diagnostics: CompositionDiagnostic[] } => ({
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
  if (typeof value.planningStatus !== "string" || !validPlanningStatuses.has(value.planningStatus as PlanningStatus)) {
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

  return { slice: value as unknown as ExecutionSlice, diagnostics: [] };
}

function validateStringArray(
  value: unknown,
  validator: (item: string) => boolean,
): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && validator(item));
}

function validateEntry(
  entry: unknown,
  sourcePath: string,
  entryIndex: number,
): { entry?: OverlayEntry; diagnostics: CompositionDiagnostic[] } {
  const diagnostics: CompositionDiagnostic[] = [];

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
  if (planningStatus !== undefined && (typeof planningStatus !== "string" || !validPlanningStatuses.has(planningStatus as PlanningStatus))) {
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

  const blockedReason = entry.blockedReason;
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
      planningStatus: planningStatus as PlanningStatus | undefined,
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

export async function loadOverlayFile(
  filePath: string,
  repoRoot: string,
): Promise<{ overlayFile?: OverlayFile; diagnostics: CompositionDiagnostic[] }> {
  const sourcePath = toSourcePath(filePath, repoRoot);
  const diagnostics: CompositionDiagnostic[] = [];

  let rawContent: string;
  try {
    rawContent = await readFile(filePath, "utf8");
  } catch (error: unknown) {
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

  let parsed: unknown;
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

  const entries: OverlayEntry[] = [];
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

  const executionSlices: ExecutionSlice[] = [];
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
