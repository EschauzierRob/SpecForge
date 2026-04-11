import path from "node:path";

import type {
  CanonicalNode,
  InferenceCandidate,
  InferenceCandidateState,
  InferenceEvidence,
  InferenceRelationship,
  InferenceResult,
  InferenceStrategyId,
  SpecNodeType,
} from "../model/types.ts";

const expectedParentTypeByChildType: Record<SpecNodeType, SpecNodeType | undefined> = {
  epic: undefined,
  feature: "epic",
  story: "feature",
  task: "story",
};

const typeRank: Record<SpecNodeType, number> = {
  epic: 0,
  feature: 1,
  story: 2,
  task: 3,
};

const stopWords = new Set([
  "a",
  "an",
  "and",
  "as",
  "by",
  "for",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

interface CandidateAccumulator {
  node: CanonicalNode;
  evidence: InferenceEvidence[];
}

interface CandidatePool {
  candidates: CanonicalNode[];
  expectedParentAvailable: boolean;
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !stopWords.has(token));
}

function getNumericTokens(value: string): string[] {
  return value.match(/\d{3,}/g) ?? [];
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function getNodeSearchText(node: CanonicalNode): string {
  return [
    node.summary,
    node.problemContext,
    ...(node.goals ?? []),
    ...(node.nonGoals ?? []),
    ...(node.requirements ?? []),
    ...(node.acceptanceCriteria ?? []),
    ...(node.dependencies ?? []),
    ...(node.openQuestions ?? []),
    node.notes,
    node.description,
    ...(node.assumptions ?? []),
    ...(node.risks ?? []),
    ...(node.constraints ?? []),
    ...(node.scenarios ?? []),
    ...(node.technicalNotes ?? []),
    ...(node.definitionOfDone ?? []),
  ]
    .filter((value): value is string => Boolean(value))
    .join("\n");
}

function hasExplicitExpectedParent(node: CanonicalNode, nodesById: Map<string, CanonicalNode>): boolean {
  const expectedParentType = expectedParentTypeByChildType[node.type];
  if (!expectedParentType) {
    return !node.parentId;
  }

  const parent = node.parentId ? nodesById.get(node.parentId) : undefined;
  return Boolean(parent && parent.type === expectedParentType);
}

function createPool(node: CanonicalNode, nodes: CanonicalNode[]): CandidatePool {
  const expectedParentType = expectedParentTypeByChildType[node.type];
  if (!expectedParentType) {
    return {
      candidates: [],
      expectedParentAvailable: false,
    };
  }

  const eligibleNodes = nodes.filter((candidate) => candidate.id !== node.id);
  const expectedParents = eligibleNodes.filter((candidate) => candidate.type === expectedParentType);
  if (expectedParents.length > 0) {
    return {
      candidates: expectedParents,
      expectedParentAvailable: true,
    };
  }

  return {
    candidates: eligibleNodes.filter((candidate) => typeRank[candidate.type] < typeRank[node.type]),
    expectedParentAvailable: false,
  };
}

function addEvidence(
  candidateMap: Map<string, CandidateAccumulator>,
  candidate: CanonicalNode,
  evidence: InferenceEvidence,
): void {
  const accumulator = candidateMap.get(candidate.id) ?? {
    node: candidate,
    evidence: [],
  };
  accumulator.evidence.push(evidence);
  candidateMap.set(candidate.id, accumulator);
}

function applyNamingStrategy(
  child: CanonicalNode,
  candidates: CanonicalNode[],
  candidateMap: Map<string, CandidateAccumulator>,
): void {
  const childNameSpace = `${child.id} ${child.title} ${child.sourcePath}`;
  const childNormalizedNameSpace = normalizeText(childNameSpace);
  const childNumericTokens = new Set(getNumericTokens(childNameSpace));
  const childTitleTokens = new Set(tokenize(child.title));

  for (const candidate of candidates) {
    if (childNormalizedNameSpace.includes(normalizeText(candidate.id))) {
      addEvidence(candidateMap, candidate, {
        strategyId: "naming",
        source: "id/title/sourcePath",
        matchedSignal: "id-reference",
        weight: 1.5,
        details: {
          referencedId: candidate.id,
        },
      });
    }

    const sharedNumericTokens = uniqueSorted(
      getNumericTokens(`${candidate.id} ${candidate.title} ${candidate.sourcePath}`).filter((token) =>
        childNumericTokens.has(token),
      ),
    );
    if (sharedNumericTokens.length > 0) {
      addEvidence(candidateMap, candidate, {
        strategyId: "naming",
        source: "id/title/sourcePath",
        matchedSignal: "shared-numeric-token",
        weight: 1,
        details: {
          tokens: sharedNumericTokens,
        },
      });
    }

    const sharedTitleTokens = uniqueSorted(tokenize(candidate.title).filter((token) => childTitleTokens.has(token)));
    if (sharedTitleTokens.length > 0) {
      addEvidence(candidateMap, candidate, {
        strategyId: "naming",
        source: "title",
        matchedSignal: "shared-title-token",
        weight: Math.min(1.5, sharedTitleTokens.length),
        details: {
          tokens: sharedTitleTokens,
        },
      });
    }
  }
}

function applyDirectoryAdjacencyStrategy(
  child: CanonicalNode,
  candidates: CanonicalNode[],
  candidateMap: Map<string, CandidateAccumulator>,
): void {
  const childDirectory = normalizePath(path.posix.dirname(normalizePath(child.sourcePath)));
  const childSegments = childDirectory.split("/");

  for (const candidate of candidates) {
    const candidateDirectory = normalizePath(path.posix.dirname(normalizePath(candidate.sourcePath)));

    if (candidateDirectory === childDirectory) {
      addEvidence(candidateMap, candidate, {
        strategyId: "directory-adjacency",
        source: "sourcePath",
        matchedSignal: "same-directory",
        weight: 1,
        details: {
          directory: childDirectory,
        },
      });
      continue;
    }

    if (childSegments.includes(path.posix.basename(candidateDirectory))) {
      addEvidence(candidateMap, candidate, {
        strategyId: "directory-adjacency",
        source: "sourcePath",
        matchedSignal: "ancestor-directory",
        weight: 0.75,
        details: {
          childDirectory,
          candidateDirectory,
        },
      });
    }
  }
}

function applyContentReferenceStrategy(
  child: CanonicalNode,
  candidates: CanonicalNode[],
  candidateMap: Map<string, CandidateAccumulator>,
): void {
  const childContent = getNodeSearchText(child);
  const normalizedContent = normalizeText(childContent);

  for (const candidate of candidates) {
    const idPattern = new RegExp(`\\b${candidate.id.replace("-", "\\-")}\\b`, "i");
    if (idPattern.test(childContent)) {
      addEvidence(candidateMap, candidate, {
        strategyId: "content-reference",
        source: "parsed-fields",
        matchedSignal: "id-reference",
        weight: 4,
        details: {
          referencedId: candidate.id,
        },
      });
    }

    const normalizedTitle = normalizeText(candidate.title);
    if (normalizedTitle.length >= 6 && normalizedContent.includes(normalizedTitle)) {
      addEvidence(candidateMap, candidate, {
        strategyId: "content-reference",
        source: "parsed-fields",
        matchedSignal: "title-reference",
        weight: 1.5,
        details: {
          referencedTitle: candidate.title,
        },
      });
    }
  }
}

function applyHeadingGrammarStrategy(
  child: CanonicalNode,
  candidates: CanonicalNode[],
  candidateMap: Map<string, CandidateAccumulator>,
): void {
  const headingPatterns = [
    {
      regex: /\b(Feature [A-Z])\b/g,
      expectedType: "feature" as const,
      weight: 1.25,
      matchedSignal: "feature-letter-heading",
    },
    {
      regex: /\b(Story \d+(?:\.\d+)+)\b/g,
      expectedType: "story" as const,
      weight: 1.25,
      matchedSignal: "story-decimal-heading",
    },
  ];

  for (const pattern of headingPatterns) {
    for (const match of child.title.matchAll(pattern.regex)) {
      const heading = match[1];
      if (!heading) {
        continue;
      }

      const normalizedHeading = normalizeText(heading);
      for (const candidate of candidates) {
        if (candidate.type !== pattern.expectedType) {
          continue;
        }

        if (!normalizeText(candidate.title).includes(normalizedHeading)) {
          continue;
        }

        addEvidence(candidateMap, candidate, {
          strategyId: "heading-grammar",
          source: "title",
          matchedSignal: pattern.matchedSignal,
          weight: pattern.weight,
          details: {
            matchedGroup: heading,
            group1: heading,
            headingPattern: pattern.regex.source,
          },
        });
      }
    }
  }
}

function applyFilenameGrammarStrategy(
  child: CanonicalNode,
  candidates: CanonicalNode[],
  candidateMap: Map<string, CandidateAccumulator>,
): void {
  const normalizedPath = normalizePath(child.sourcePath);
  const baseName = path.posix.basename(normalizedPath);
  const extension = path.posix.extname(baseName);
  const stem = extension.length > 0 ? baseName.slice(0, -extension.length) : baseName;
  const isExtensionless = !baseName.includes(".");

  const featureMatch = stem.match(/^(feature-[a-z0-9-]+)$/i);
  if (featureMatch) {
    const featureToken = featureMatch[1];
    for (const candidate of candidates) {
      if (candidate.type !== "feature") {
        continue;
      }

      const candidatePath = normalizePath(candidate.sourcePath);
      const candidateStem = path.posix.basename(candidatePath, path.posix.extname(candidatePath));
      if (candidateStem !== featureToken) {
        continue;
      }

      addEvidence(candidateMap, candidate, {
        strategyId: "filename-grammar",
        source: "sourcePath",
        matchedSignal: isExtensionless ? "extensionless-feature-file" : "feature-prefix-filename",
        weight: isExtensionless ? 1.75 : 1.25,
        details: {
          matchedGroup: featureToken,
          group1: featureToken,
          extensionless: isExtensionless,
        },
      });
    }
  }

  const sliceMatch = stem.match(/^(slice-[a-z0-9-]+)$/i);
  if (sliceMatch) {
    const sliceToken = sliceMatch[1];
    const sliceSuffix = sliceToken.replace(/^slice-/i, "");
    for (const candidate of candidates) {
      if (candidate.type !== "feature") {
        continue;
      }

      const normalizedCandidatePath = normalizeText(candidate.sourcePath);
      const normalizedCandidateTitle = normalizeText(candidate.title);
      if (
        !normalizedCandidatePath.includes(normalizeText(sliceSuffix)) &&
        !normalizedCandidateTitle.includes(normalizeText(sliceSuffix))
      ) {
        continue;
      }

      addEvidence(candidateMap, candidate, {
        strategyId: "filename-grammar",
        source: "sourcePath",
        matchedSignal: "slice-prefix-filename",
        weight: 1,
        details: {
          matchedGroup: sliceToken,
          group1: sliceToken,
          group2: sliceSuffix,
        },
      });
    }
  }
}

function applyCrossReferenceGrammarStrategy(
  child: CanonicalNode,
  candidates: CanonicalNode[],
  candidateMap: Map<string, CandidateAccumulator>,
): void {
  const searchText = `${child.title}\n${getNodeSearchText(child)}`;
  const mentionPattern = /\b(Feature|Epic)\s+([A-Z]|\d+(?:\.\d+)*)\b/g;

  for (const match of searchText.matchAll(mentionPattern)) {
    const entity = match[1];
    const reference = match[2];
    const fullMatch = match[0];
    if (!entity || !reference || !fullMatch) {
      continue;
    }

    const expectedType: SpecNodeType = entity.toLowerCase() === "epic" ? "epic" : "feature";
    const normalizedFullMatch = normalizeText(fullMatch);
    for (const candidate of candidates) {
      if (candidate.type !== expectedType) {
        continue;
      }

      const candidateNamespace = normalizeText(`${candidate.id} ${candidate.title} ${candidate.sourcePath}`);
      if (!candidateNamespace.includes(normalizedFullMatch) && !candidateNamespace.includes(normalizeText(reference))) {
        continue;
      }

      addEvidence(candidateMap, candidate, {
        strategyId: "cross-reference-grammar",
        source: "title/parsed-fields",
        matchedSignal: `${entity.toLowerCase()}-reference`,
        weight: 2.25,
        details: {
          matchedGroup: fullMatch,
          group1: entity,
          group2: reference,
        },
      });
    }
  }
}

function hasStrongContentIdReference(candidate: CandidateAccumulator): boolean {
  return candidate.evidence.some(
    (evidence) => evidence.strategyId === "content-reference" && evidence.matchedSignal === "id-reference",
  );
}

function hasEnoughWeakSupport(candidate: CandidateAccumulator, supportScore: number): boolean {
  const nonContentStrategyIds = new Set<InferenceStrategyId>(
    candidate.evidence
      .map((evidence) => evidence.strategyId)
      .filter((strategyId) => strategyId !== "content-reference"),
  );

  return supportScore >= 2 && nonContentStrategyIds.size >= 2;
}

function isSelectable(
  candidate: CandidateAccumulator,
  supportScore: number,
  expectedParentAvailable: boolean,
): boolean {
  return expectedParentAvailable && (hasStrongContentIdReference(candidate) || hasEnoughWeakSupport(candidate, supportScore));
}

function toInferenceCandidate(
  child: CanonicalNode,
  accumulator: CandidateAccumulator,
  state: InferenceCandidateState,
): InferenceCandidate {
  const supportScore = accumulator.evidence.reduce((score, evidence) => score + evidence.weight, 0);

  return {
    key: `candidate:${child.id}:${accumulator.node.id}`,
    parentId: accumulator.node.id,
    parentSourcePath: accumulator.node.sourcePath,
    state,
    supportScore,
    evidence: [...accumulator.evidence].sort(
      (left, right) =>
        left.strategyId.localeCompare(right.strategyId) ||
        left.matchedSignal.localeCompare(right.matchedSignal) ||
        left.source.localeCompare(right.source),
    ),
  };
}

function compareCandidates(left: InferenceCandidate, right: InferenceCandidate): number {
  const stateRank: Record<InferenceCandidateState, number> = {
    selected: 0,
    ambiguous: 1,
    candidate: 2,
    rejected: 3,
  };

  return (
    stateRank[left.state] - stateRank[right.state] ||
    right.supportScore - left.supportScore ||
    left.parentId.localeCompare(right.parentId)
  );
}

function inferRelationshipForNode(
  child: CanonicalNode,
  nodes: CanonicalNode[],
  nodesById: Map<string, CanonicalNode>,
): InferenceRelationship | undefined {
  if (child.type === "epic" || hasExplicitExpectedParent(child, nodesById)) {
    return undefined;
  }

  const originalParentId = child.parentId;
  const pool = createPool(child, nodes);
  const candidateMap = new Map<string, CandidateAccumulator>();

  applyNamingStrategy(child, pool.candidates, candidateMap);
  applyDirectoryAdjacencyStrategy(child, pool.candidates, candidateMap);
  applyContentReferenceStrategy(child, pool.candidates, candidateMap);
  applyHeadingGrammarStrategy(child, pool.candidates, candidateMap);
  applyFilenameGrammarStrategy(child, pool.candidates, candidateMap);
  applyCrossReferenceGrammarStrategy(child, pool.candidates, candidateMap);

  const accumulators = Array.from(candidateMap.values()).sort((left, right) => left.node.id.localeCompare(right.node.id));
  const scored = accumulators
    .map((accumulator) => ({
      accumulator,
      supportScore: accumulator.evidence.reduce((score, evidence) => score + evidence.weight, 0),
    }))
    .sort(
      (left, right) =>
        right.supportScore - left.supportScore ||
        left.accumulator.node.id.localeCompare(right.accumulator.node.id),
    );
  const topScore = scored[0]?.supportScore ?? 0;
  const topCandidates = scored.filter((candidate) => candidate.supportScore === topScore);
  const selectableTopCandidates = topCandidates.filter((candidate) =>
    isSelectable(candidate.accumulator, candidate.supportScore, pool.expectedParentAvailable),
  );

  let selectedParentId: string | undefined;
  let relationshipState: InferenceRelationship["state"] = "unresolved";
  if (selectableTopCandidates.length === 1 && topCandidates.length === 1) {
    selectedParentId = selectableTopCandidates[0].accumulator.node.id;
    child.parentId = selectedParentId;
    relationshipState = "inferred";
  } else if (selectableTopCandidates.length > 1) {
    relationshipState = "ambiguous";
  }

  const candidates = scored
    .map(({ accumulator, supportScore }) => {
      let state: InferenceCandidateState = "rejected";
      if (selectedParentId && accumulator.node.id === selectedParentId) {
        state = "selected";
      } else if (!selectedParentId && relationshipState === "ambiguous" && supportScore === topScore) {
        state = "ambiguous";
      } else if (isSelectable(accumulator, supportScore, pool.expectedParentAvailable)) {
        state = "candidate";
      }

      return toInferenceCandidate(child, accumulator, state);
    })
    .sort(compareCandidates);

  return {
    key: `edge:${child.id}`,
    childId: child.id,
    childSourcePath: child.sourcePath,
    explicitParentId: originalParentId,
    selectedParentId,
    state: relationshipState,
    candidates,
  };
}

export function inferHierarchyRelationships(nodes: CanonicalNode[]): InferenceResult | undefined {
  const nodesById = new Map(nodes.map((node) => [node.id, node] as const));
  const relationships = nodes
    .map((node) => inferRelationshipForNode(node, nodes, nodesById))
    .filter((relationship): relationship is InferenceRelationship => Boolean(relationship))
    .sort((left, right) => left.childId.localeCompare(right.childId));

  return relationships.length > 0 ? { relationships } : undefined;
}
