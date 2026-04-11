import type { NormalizedDecisionRecord, SectionMap } from "../model/types.ts";

const decisionHeadingIdPattern = /^D-\d{4}-\d+$/i;

function normalizeDecisionText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeLinePayload(value: string): string {
  return value.replace(/^[-*]\s+/, "").trim();
}

function parseDecisionPairs(content: string): Array<{ decision: string; reason?: string }> {
  const lines = content.split("\n").map((line) => normalizeLinePayload(line));
  const parsed: Array<{ decision: string; reason?: string }> = [];
  let pendingDecision: string | undefined;

  for (const line of lines) {
    const decisionMatch = line.match(/^Decision:\s*(.+)$/i);
    if (decisionMatch) {
      pendingDecision = normalizeDecisionText(decisionMatch[1]);
      continue;
    }

    const reasonMatch = line.match(/^Reason:\s*(.+)$/i);
    if (reasonMatch && pendingDecision) {
      parsed.push({
        decision: pendingDecision,
        reason: normalizeDecisionText(reasonMatch[1]),
      });
      pendingDecision = undefined;
    }
  }

  if (pendingDecision) {
    parsed.push({
      decision: pendingDecision,
    });
  }

  return parsed;
}

export function extractNormalizedDecisionRecords(sectionMap: SectionMap, sourcePath: string): NormalizedDecisionRecord[] {
  const records: NormalizedDecisionRecord[] = [];

  for (const sectionName of sectionMap.order) {
    const content = sectionMap.rawSections[sectionName];
    const sectionOffset = sectionMap.sectionOffsets[sectionName];
    if (!content || !sectionOffset) {
      continue;
    }

    const headingDecisionId = decisionHeadingIdPattern.test(sectionName.trim()) ? sectionName.trim().toUpperCase() : undefined;
    const decisionPairs = parseDecisionPairs(content);
    if (headingDecisionId && decisionPairs.length === 0) {
      const nonEmptyLines = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      if (nonEmptyLines.length > 0) {
        records.push({
          sourcePath,
          sectionName,
          sectionOffset,
          decisionId: headingDecisionId,
          decision: normalizeDecisionText(nonEmptyLines[0]),
          ...(nonEmptyLines[1] ? { reason: normalizeDecisionText(nonEmptyLines[1]) } : {}),
        });
      }
      continue;
    }

    for (const pair of decisionPairs) {
      records.push({
        sourcePath,
        sectionName,
        sectionOffset,
        ...(headingDecisionId ? { decisionId: headingDecisionId } : {}),
        decision: pair.decision,
        ...(pair.reason ? { reason: pair.reason } : {}),
      });
    }
  }

  return records;
}
