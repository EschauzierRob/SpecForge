import type { SectionMap } from "../model/types.ts";

function normalizeSectionName(sectionName: string): string {
  return sectionName.trim().toLowerCase();
}

export function tokenizeSections(markdown: string): SectionMap {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const sections: Record<string, string> = {};
  const rawSections: Record<string, string> = {};
  const sectionOffsets: Record<string, { startLine: number; endLine: number }> = {};
  const order: string[] = [];

  let currentRawName: string | undefined;
  let currentKey: string | undefined;
  let currentHeadingLine = 0;
  let buffer: string[] = [];

  const flush = (endLine: number): void => {
    if (!currentKey || !currentRawName) {
      return;
    }

    const content = buffer.join("\n").trim();
    sections[currentKey] = content;
    rawSections[currentRawName] = content;
    sectionOffsets[currentRawName] = {
      startLine: currentHeadingLine,
      endLine: Math.max(currentHeadingLine, endLine),
    };
    order.push(currentRawName);
    buffer = [];
  };

  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1;
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      flush(lineNumber - 1);
      currentRawName = heading[1].trim();
      currentKey = normalizeSectionName(currentRawName);
      currentHeadingLine = lineNumber;
      continue;
    }

    if (currentKey) {
      buffer.push(line);
    }
  }

  flush(lines.length);

  return {
    order,
    sections,
    rawSections,
    sectionOffsets,
  };
}
