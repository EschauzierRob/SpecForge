import type { SectionMap } from "../model/types.ts";

function normalizeSectionName(sectionName: string): string {
  return sectionName.trim().toLowerCase();
}

export function tokenizeSections(markdown: string): SectionMap {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const sections: Record<string, string> = {};
  const rawSections: Record<string, string> = {};
  const order: string[] = [];

  let currentRawName: string | undefined;
  let currentKey: string | undefined;
  let buffer: string[] = [];

  const flush = (): void => {
    if (!currentKey || !currentRawName) {
      return;
    }

    const content = buffer.join("\n").trim();
    sections[currentKey] = content;
    rawSections[currentRawName] = content;
    order.push(currentRawName);
    buffer = [];
  };

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      flush();
      currentRawName = heading[1].trim();
      currentKey = normalizeSectionName(currentRawName);
      continue;
    }

    if (currentKey) {
      buffer.push(line);
    }
  }

  flush();

  return {
    order,
    sections,
    rawSections,
  };
}
