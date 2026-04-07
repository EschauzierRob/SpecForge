import { readFile } from "node:fs/promises";
import path from "node:path";

import type {
  CompositionDiagnostic,
  OverlayEntry,
  OverlayFile,
  PlanningStatus,
} from "../model/types.ts";

const validPlanningStatuses = new Set<PlanningStatus>([
  "backlog",
  "ready",
  "in_progress",
  "blocked",
  "done",
]);

const overlayEntryKeys = new Set([
  "specId",
  "planningStatus",
  "rank",
  "blocked",
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
    (key) => !["version", "repositoryId", "entries"].includes(key),
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
  } else if (version !== "0.1") {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-overlay-version",
          message: `Overlay file version ${version} is outside the MVP contract; attempting to load it.`,
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

  return {
    overlayFile: {
      sourcePath,
      version,
      repositoryId,
      entries,
    },
    diagnostics,
  };
}
