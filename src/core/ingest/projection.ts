import path from "node:path";

import type {
  CanonicalNode,
  InferenceCandidate,
  InferenceEvidence,
  InferenceRelationship,
  InferenceVirtualNode,
  ParseSpecFileResult,
  RepositoryDiscovery,
  SpecNodeType,
} from "../model/types.ts";

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}

function createVirtualId(sourcePath: string): string {
  const slug = normalizePath(sourcePath)
    .replace(/^specs\//, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
  return `VS-${slug}`;
}

function inferSliceTitle(sourcePath: string): string {
  const baseName = path.posix.basename(sourcePath);
  const withoutExtension = baseName.replace(/\.[^.]+$/, "");
  return withoutExtension
    .replace(/^slice[-_]?/i, "Slice ")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function scoreParentDistance(sourcePath: string, parentSourcePath: string): number {
  const sourceSegments = normalizePath(path.posix.dirname(sourcePath)).split("/");
  const parentSegments = normalizePath(path.posix.dirname(parentSourcePath)).split("/");

  let sharedPrefix = 0;
  while (
    sharedPrefix < sourceSegments.length &&
    sharedPrefix < parentSegments.length &&
    sourceSegments[sharedPrefix] === parentSegments[sharedPrefix]
  ) {
    sharedPrefix += 1;
  }

  return sourceSegments.length + parentSegments.length - 2 * sharedPrefix;
}

function selectNearestEpicOrFeature(sourcePath: string, nodes: CanonicalNode[]): CanonicalNode | undefined {
  const eligible = nodes.filter((node) => node.type === "epic" || node.type === "feature");
  return eligible
    .map((node) => ({ node, distance: scoreParentDistance(sourcePath, node.sourcePath) }))
    .sort(
      (left, right) =>
        left.distance - right.distance ||
        (left.node.type === "feature" ? -1 : 1) - (right.node.type === "feature" ? -1 : 1) ||
        left.node.id.localeCompare(right.node.id),
    )[0]?.node;
}

function buildEvidence(sourcePath: string, parent: CanonicalNode): InferenceEvidence[] {
  const sourceDirectory = normalizePath(path.posix.dirname(sourcePath));
  const parentDirectory = normalizePath(path.posix.dirname(parent.sourcePath));
  const sourceName = path.posix.basename(sourcePath);

  return [
    {
      strategyId: "directory-adjacency",
      source: "adapter-projection",
      matchedSignal: "nearest-epic-feature-directory",
      weight: 2,
      details: {
        sourceDirectory,
        parentDirectory,
        parentId: parent.id,
        parentSourcePath: parent.sourcePath,
      },
    },
    {
      strategyId: "naming",
      source: "adapter-projection",
      matchedSignal: "slice-file-name",
      weight: sourceName.toLowerCase().includes("slice-") ? 1.5 : 1,
      details: {
        fileName: sourceName,
        virtualType: "slice",
      },
    },
  ];
}

function toRelationship(virtualNode: InferenceVirtualNode): InferenceRelationship {
  const candidate: InferenceCandidate = {
    key: `candidate:${virtualNode.id}:${virtualNode.parentId}`,
    parentId: virtualNode.parentId,
    parentSourcePath: String(virtualNode.evidence[0]?.details.parentSourcePath ?? ""),
    state: "selected",
    supportScore: virtualNode.evidence.reduce((score, evidence) => score + evidence.weight, 0),
    evidence: virtualNode.evidence,
  };

  return {
    key: `edge:${virtualNode.id}`,
    childId: virtualNode.id,
    childSourcePath: virtualNode.sourcePath,
    selectedParentId: virtualNode.parentId,
    state: "inferred",
    candidates: [candidate],
  };
}

export function inferAdapterProjectionVirtualNodes(
  discovery: RepositoryDiscovery,
  parseResultsBySourcePath: Map<string, ParseSpecFileResult>,
  parsedNodes: CanonicalNode[],
): { virtualNodes: InferenceVirtualNode[]; relationships: InferenceRelationship[] } {

  const virtualNodes: InferenceVirtualNode[] = [];

  for (const sourcePath of discovery.adapterIncludedSpecFiles) {
    const fileName = path.posix.basename(sourcePath).toLowerCase();
    if (!fileName.startsWith("slice-")) {
      continue;
    }

    const parseResult = parseResultsBySourcePath.get(sourcePath);
    if (parseResult?.node) {
      continue;
    }

    const parent = selectNearestEpicOrFeature(sourcePath, parsedNodes);
    if (!parent) {
      continue;
    }

    const projectedType: SpecNodeType = parent.type === "epic" ? "feature" : "story";
    virtualNodes.push({
      id: createVirtualId(sourcePath),
      sourcePath,
      title: inferSliceTitle(sourcePath),
      parentId: parent.id,
      virtualType: "slice",
      projectedType,
      evidence: buildEvidence(sourcePath, parent),
    });
  }

  virtualNodes.sort((left, right) => left.sourcePath.localeCompare(right.sourcePath));

  return {
    virtualNodes,
    relationships: virtualNodes.map((node) => toRelationship(node)),
  };
}
