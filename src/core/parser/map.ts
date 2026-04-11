import { readFile } from "node:fs/promises";

import type {
  CanonicalNode,
  ParseSpecFileResult,
  ParsedSpecFile,
  ParserDiagnostic,
  SectionMap,
  SpecNodeType,
} from "../model/types.ts";
import { extractNormalizedDecisionRecords } from "./decision-adapter.ts";
import { tokenizeSections } from "./sections.ts";

const knownSections = new Set([
  "id",
  "type",
  "parent",
  "summary",
  "problem / context",
  "goals",
  "non-goals",
  "requirements",
  "acceptance criteria",
  "dependencies",
  "open questions",
  "notes",
  "description",
  "assumptions",
  "risks",
  "constraints",
  "scenarios",
  "technical notes",
  "definition of done",
]);

const validTypes: SpecNodeType[] = ["epic", "feature", "story", "task"];

const requiredSectionsByType: Record<SpecNodeType, string[]> = {
  epic: ["summary"],
  feature: ["summary", "parent", "requirements"],
  story: ["summary", "parent", "acceptance criteria"],
  task: ["summary", "parent"],
};

interface FallbackSignals {
  title?: string;
  summary?: string;
  candidateMarkers: string[];
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n/g, "\n");
}

function extractTitle(markdown: string): string | undefined {
  const match = normalizeNewlines(markdown).match(/^#\s+(.+?)\s*$/m);
  return match?.[1]?.trim();
}

function createDiagnostic(
  diagnostic: Omit<ParserDiagnostic, "sourcePath"> & { sourcePath?: string },
  sourcePath: string,
): ParserDiagnostic {
  return {
    sourcePath,
    ...diagnostic,
  };
}

function firstNonEmptyLine(sectionValue: string | undefined): string | undefined {
  if (!sectionValue) {
    return undefined;
  }

  return normalizeNewlines(sectionValue)
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
}

function parseList(sectionValue: string | undefined): string[] | undefined {
  if (!sectionValue) {
    return undefined;
  }

  const items = normalizeNewlines(sectionValue)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/^[-*]\s+\[[ xX]\]\s*/, ""))
    .map((line) => line.replace(/^[-*]\s+/, ""))
    .map((line) => line.replace(/^\d+\.\s+/, ""))
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.toLowerCase() !== "none");

  return items.length > 0 ? items : undefined;
}

function parseFreeText(sectionValue: string | undefined): string | undefined {
  const line = firstNonEmptyLine(sectionValue);
  return line && line.toLowerCase() !== "none" ? normalizeNewlines(sectionValue).trim() : undefined;
}

function parseDependencies(sectionValue: string | undefined): string[] | undefined {
  if (!sectionValue) {
    return undefined;
  }

  const matches = sectionValue.match(/[EFST]-\d{4}/g) ?? [];
  const unique = Array.from(new Set(matches));
  return unique.length > 0 ? unique : undefined;
}

function parseParentId(sectionValue: string | undefined): string | undefined {
  const line = firstNonEmptyLine(sectionValue);
  if (!line || line.toLowerCase() === "none") {
    return undefined;
  }

  const match = line.match(/[EFST]-\d{4}/);
  return match?.[0];
}

function parseType(sectionValue: string | undefined): SpecNodeType | undefined {
  const line = firstNonEmptyLine(sectionValue)?.toLowerCase();
  if (!line || !validTypes.includes(line as SpecNodeType)) {
    return undefined;
  }

  return line as SpecNodeType;
}

function findFallbackSummary(markdown: string): string | undefined {
  const normalized = normalizeNewlines(markdown);
  const paragraphMatches = normalized.match(/(?:^|\n\n)([^\n].*?(?:\n(?!\n).*)*)/g) ?? [];

  for (const rawParagraph of paragraphMatches) {
    const paragraph = rawParagraph.trim();
    if (!paragraph) {
      continue;
    }

    const cleanedLines = paragraph
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !line.startsWith("#"))
      .filter((line) => !line.startsWith("##"))
      .filter((line) => !/^[-*]\s+/.test(line))
      .filter((line) => !/^\d+\.\s+/.test(line));

    if (cleanedLines.length === 0) {
      continue;
    }

    const candidate = cleanedLines.join(" ").trim();
    if (candidate.length >= 20) {
      return candidate;
    }
  }

  return undefined;
}

function extractFallbackSignals(markdown: string): FallbackSignals {
  const normalized = normalizeNewlines(markdown);
  const candidateMarkers = Array.from(
    new Set(
      normalized
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .filter((line) => /\b(epic|feature|story|task)\s+([a-z]|\d+(?:\.\d+)?)\b/i.test(line)),
    ),
  );

  const firstLine = normalized
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0)
    ?.replace(/^#+\s+/, "")
    .trim();

  return {
    title: firstLine,
    summary: findFallbackSummary(normalized),
    candidateMarkers,
  };
}

function addMissingFieldDiagnostic(
  diagnostics: ParserDiagnostic[],
  sourcePath: string,
  sectionName: string,
  specId?: string,
): void {
  diagnostics.push(
    createDiagnostic(
      {
        severity: "warning",
        code: "missing-required-section",
        message: `Missing required section: ${sectionName}.`,
        specId,
        sectionName,
      },
      sourcePath,
    ),
  );
}

export function mapSectionsToCanonical(parsedFile: ParsedSpecFile): ParseSpecFileResult {
  const diagnostics: ParserDiagnostic[] = [];
  const { sectionMap, sourcePath } = parsedFile;
  const canonicalTitle = parsedFile.title?.trim();
  const fallbackSignals = parsedFile.rawContent ? extractFallbackSignals(parsedFile.rawContent) : undefined;
  const usedFallbackTitle = !canonicalTitle && Boolean(fallbackSignals?.title);
  const title = canonicalTitle ?? fallbackSignals?.title;

  if (!canonicalTitle) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "missing-title",
          message: "Missing top-level # title heading.",
        },
        sourcePath,
      ),
    );
  }

  if (usedFallbackTitle) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "info",
          code: "fallback-title",
          message: "Used fallback title from the first non-empty line.",
        },
        sourcePath,
      ),
    );
  }

  const id = firstNonEmptyLine(sectionMap.sections.id);
  if (!id) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "missing-required-section",
          message: "Missing required section: ID.",
          sectionName: "ID",
        },
        sourcePath,
      ),
    );
  }

  const type = parseType(sectionMap.sections.type);
  if (!type) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "invalid-or-missing-type",
          message: "Missing or invalid Type section.",
          specId: id,
          sectionName: "Type",
        },
        sourcePath,
      ),
    );
  }

  const canonicalSummary = parseFreeText(sectionMap.sections.summary);
  const usedFallbackSummary = !canonicalSummary && Boolean(fallbackSignals?.summary);
  const summary = canonicalSummary ?? fallbackSignals?.summary;

  if (!canonicalSummary) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "missing-required-section",
          message: "Missing required section: Summary.",
          specId: id,
          sectionName: "Summary",
        },
        sourcePath,
      ),
    );
  }

  if (usedFallbackSummary) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "info",
          code: "fallback-summary",
          message: "Used fallback summary from the first meaningful paragraph.",
          specId: id,
          sectionName: "Summary",
        },
        sourcePath,
      ),
    );
  }

  for (const rawName of sectionMap.order) {
    const normalized = rawName.trim().toLowerCase();
    if (!knownSections.has(normalized)) {
      diagnostics.push(
        createDiagnostic(
          {
            severity: "info",
            code: "unknown-section",
            message: `Unknown section preserved as parser metadata: ${rawName}.`,
            specId: id,
            sectionName: rawName,
          },
          sourcePath,
        ),
      );
    }
  }

  if (type) {
    for (const requiredSection of requiredSectionsByType[type]) {
      if (!firstNonEmptyLine(sectionMap.sections[requiredSection])) {
        addMissingFieldDiagnostic(diagnostics, sourcePath, requiredSection, id);
      }
    }
  }

  const parentId = parseParentId(sectionMap.sections.parent);
  if (type && type !== "epic" && !parentId) {
    diagnostics.push(
      createDiagnostic(
        {
          severity: "warning",
          code: "missing-parent",
          message: "Non-epic spec is missing a resolvable parent ID.",
          specId: id,
          sectionName: "Parent",
        },
        sourcePath,
      ),
    );
  }

  if (!id || !type || !title || !summary) {
    return { node: undefined, diagnostics };
  }

  const unknownSections = Object.fromEntries(
    Object.entries(sectionMap.rawSections).filter(([name]) => !knownSections.has(name.trim().toLowerCase())),
  );
  const normalizedDecisions = extractNormalizedDecisionRecords(sectionMap, sourcePath);

  const node: CanonicalNode = {
    id,
    type,
    title,
    summary,
    sourcePath,
    parentId,
    childrenIds: [],
    problemContext: parseFreeText(sectionMap.sections["problem / context"]),
    goals: parseList(sectionMap.sections.goals),
    nonGoals: parseList(sectionMap.sections["non-goals"]),
    requirements: parseList(sectionMap.sections.requirements),
    acceptanceCriteria: parseList(sectionMap.sections["acceptance criteria"]),
    dependencies: parseDependencies(sectionMap.sections.dependencies),
    openQuestions: parseList(sectionMap.sections["open questions"]),
    notes: parseFreeText(sectionMap.sections.notes),
    description: parseFreeText(sectionMap.sections.description),
    assumptions: parseList(sectionMap.sections.assumptions),
    risks: parseList(sectionMap.sections.risks),
    constraints: parseList(sectionMap.sections.constraints),
    scenarios: parseList(sectionMap.sections.scenarios),
    technicalNotes: parseList(sectionMap.sections["technical notes"]),
    definitionOfDone: parseList(sectionMap.sections["definition of done"]),
    parserMetadata: {
      sectionOrder: [...sectionMap.order],
      unknownSections,
      ...(normalizedDecisions.length > 0 ? { normalizedDecisions } : {}),
      fallbackExtraction:
        fallbackSignals && (usedFallbackTitle || usedFallbackSummary || fallbackSignals.candidateMarkers.length > 0)
          ? {
              title: usedFallbackTitle ? fallbackSignals.title : undefined,
              summary: usedFallbackSummary ? fallbackSignals.summary : undefined,
              candidateMarkers: fallbackSignals.candidateMarkers,
            }
          : undefined,
    },
  };

  return {
    node,
    diagnostics,
  };
}

export async function parseSpecFile(filePath: string, repoRoot: string): Promise<ParseSpecFileResult> {
  const markdown = await readFile(filePath, "utf8");
  const title = extractTitle(markdown);
  const relativeSourcePath = filePath
    .replace(repoRoot, "")
    .replace(/^[\\/]+/, "")
    .replace(/\\/g, "/");

  if (markdown.trim().length === 0) {
    return {
      diagnostics: [
        {
          severity: "warning",
          code: "empty-file",
          message: "Spec file is empty.",
          sourcePath: relativeSourcePath,
        },
      ],
    };
  }

  const sectionMap: SectionMap = tokenizeSections(markdown);
  return mapSectionsToCanonical({
    title,
    sectionMap,
    sourcePath: relativeSourcePath,
    rawContent: markdown,
  });
}
