import { ingestRepository } from "../ingest/ingest.ts";
import type {
  CanonicalNode,
  CompositionDiagnostic,
  DiagnosticSeverity,
  IngestResult,
  ParserDiagnostic,
  RepositoryAdapterOptions,
  SpecNodeType,
  ValidationFinding,
  ValidationResult,
  ValidationSummary,
} from "../model/types.ts";

const expectedParentTypeByChildType: Record<SpecNodeType, SpecNodeType | undefined> = {
  epic: undefined,
  feature: "epic",
  story: "feature",
  task: "story",
};

const requiredFieldSectionsByType: Record<SpecNodeType, string[]> = {
  epic: ["Summary", "Goals", "Non-goals"],
  feature: ["Summary", "Requirements"],
  story: ["Summary", "Acceptance Criteria"],
  task: ["Summary"],
};

const expectedPathPatterns: Record<SpecNodeType, RegExp> = {
  epic: /^specs\/epic-(\d{4})-[^/]+\/epic\.md$/,
  feature: /^specs\/epic-\d{4}-[^/]+\/feature-(\d{4})-[^/]+\.md$/,
  story: /^specs\/epic-\d{4}-[^/]+\/story-(\d{4})-[^/]+\.md$/,
  task: /^specs\/epic-\d{4}-[^/]+\/task-(\d{4})-[^/]+\.md$/,
};

const parseabilityPenaltyByDiagnosticCode: Record<string, number> = {
  "empty-file": 1,
  "invalid-or-missing-type": 0.45,
  "missing-title": 0.35,
  "missing-required-section": 0.2,
  "missing-parent": 0.15,
};

function createFinding(
  finding: ValidationFinding,
): ValidationFinding {
  return {
    ...finding,
    sourcePaths: [...new Set(finding.sourcePaths)].sort((left, right) => left.localeCompare(right)),
  };
}

function addFinding(
  findings: ValidationFinding[],
  finding: ValidationFinding,
): void {
  findings.push(createFinding(finding));
}

function compareFindings(left: ValidationFinding, right: ValidationFinding): number {
  return (
    left.ruleId.localeCompare(right.ruleId) ||
    (left.specId ?? "").localeCompare(right.specId ?? "") ||
    left.sourcePaths.join("|").localeCompare(right.sourcePaths.join("|")) ||
    left.message.localeCompare(right.message)
  );
}

function summarizeFindings(findings: ValidationFinding[]): ValidationSummary {
  const bySeverity: Record<DiagnosticSeverity, number> = {
    error: 0,
    warning: 0,
    info: 0,
  };
  const byRuleId: Record<string, number> = {};

  for (const finding of findings) {
    bySeverity[finding.severity] += 1;
    byRuleId[finding.ruleId] = (byRuleId[finding.ruleId] ?? 0) + 1;
  }

  return {
    total: findings.length,
    bySeverity,
    byRuleId,
  };
}

function buildFirstNodeIndex(canonicalNodes: CanonicalNode[]): Map<string, CanonicalNode> {
  const index = new Map<string, CanonicalNode>();
  for (const node of canonicalNodes) {
    if (!index.has(node.id)) {
      index.set(node.id, node);
    }
  }

  return index;
}

function buildDuplicateNodeIndex(canonicalNodes: CanonicalNode[]): Map<string, CanonicalNode[]> {
  const duplicateIndex = new Map<string, CanonicalNode[]>();

  for (const node of canonicalNodes) {
    const nodes = duplicateIndex.get(node.id) ?? [];
    nodes.push(node);
    duplicateIndex.set(node.id, nodes);
  }

  return duplicateIndex;
}

function calculateParseabilityScore(diagnosticCodes: string[]): number {
  const penalty = diagnosticCodes.reduce(
    (score, code) => score + (parseabilityPenaltyByDiagnosticCode[code] ?? 0.1),
    0,
  );

  return Math.max(0, Math.min(1, 1 - penalty));
}

function hasRecoverableHierarchySignal(
  result: IngestResult,
  node: CanonicalNode,
): boolean {
  if (node.type === "epic") {
    return true;
  }

  if (node.parentId) {
    return true;
  }

  return (result.inference?.relationships ?? []).some(
    (relationship) =>
      relationship.childId === node.id &&
      (relationship.selectedParentId || relationship.explicitParentId),
  );
}

function validatePathConventionRule(
  result: IngestResult,
  node: CanonicalNode,
  findings: ValidationFinding[],
  diagnosticCodesBySourcePath: Map<string, string[]>,
  discoveredSpecPaths: Set<string>,
): void {
  const expectedPattern = expectedPathPatterns[node.type];
  const match = node.sourcePath.match(expectedPattern);
  const nodeIdSuffix = node.id.split("-")[1] ?? "";
  if (match && match[1] === nodeIdSuffix) {
    return;
  }

  const profile = result.discovery.validationProfile;
  if (profile === "canonical") {
    addFinding(findings, {
      ruleId: "V-007",
      severity: "warning",
      message: `Item ${node.id} does not follow the expected file or folder naming convention.`,
      specId: node.id,
      sourcePaths: [node.sourcePath],
      remediationHint: "Rename the file or folder to match the documented spec conventions.",
    });
    return;
  }

  const discoverable = discoveredSpecPaths.has(node.sourcePath);
  const parseabilityScore = calculateParseabilityScore(diagnosticCodesBySourcePath.get(node.sourcePath) ?? []);
  const recoverableHierarchy = hasRecoverableHierarchySignal(result, node);

  if (!discoverable || parseabilityScore < 0.35 || !recoverableHierarchy) {
    addFinding(findings, {
      ruleId: "V-007",
      severity: "warning",
      message:
        `Adapter profile flagged ${node.id} as non-canonical and currently unparseable ` +
        `(discoverable=${discoverable}, parseability=${parseabilityScore.toFixed(2)}, recoverableHierarchy=${recoverableHierarchy}).`,
      specId: node.id,
      sourcePaths: [node.sourcePath],
      remediationHint: "Fix the source shape so adapter parsing can recover structure and hierarchy.",
    });
    return;
  }

  addFinding(findings, {
    ruleId: "V-007",
    severity: "warning",
    message:
      `Adapter profile understood ${node.id} even though it is non-canonical ` +
      `(discoverable=${discoverable}, parseability=${parseabilityScore.toFixed(2)}, recoverableHierarchy=${recoverableHierarchy}).`,
    specId: node.id,
    sourcePaths: [node.sourcePath],
    remediationHint: "Optionally rename the file or folder to canonical conventions for consistency.",
  });
}

function validateAdapterOnlyFileConventions(
  result: IngestResult,
  findings: ValidationFinding[],
  diagnosticCodesBySourcePath: Map<string, string[]>,
  discoveredSpecPaths: Set<string>,
): void {
  if (result.discovery.validationProfile === "canonical") {
    return;
  }

  for (const sourcePath of result.discovery.adapterIncludedSpecFiles) {
    const discoverable = discoveredSpecPaths.has(sourcePath);
    const parseabilityScore = calculateParseabilityScore(diagnosticCodesBySourcePath.get(sourcePath) ?? []);
    const recoverableHierarchy = (result.inference?.relationships ?? []).some(
      (relationship) => relationship.childSourcePath === sourcePath && Boolean(relationship.selectedParentId),
    );
    const inferredSpecId = (result.inference?.relationships ?? []).find(
      (relationship) => relationship.childSourcePath === sourcePath,
    )?.childId;

    if (!discoverable || parseabilityScore < 0.35 || !recoverableHierarchy) {
      addFinding(findings, {
        ruleId: "V-007",
        severity: "warning",
        message:
          `Adapter profile found ${sourcePath} but it is currently unparseable ` +
          `(discoverable=${discoverable}, parseability=${parseabilityScore.toFixed(2)}, recoverableHierarchy=${recoverableHierarchy}).`,
        specId: inferredSpecId,
        sourcePaths: [sourcePath],
        remediationHint: "Add recoverable structure or canonical sections so the adapter can understand this file.",
      });
      continue;
    }

    addFinding(findings, {
      ruleId: "V-007",
      severity: "warning",
      message:
        `Adapter profile interpreted ${sourcePath} as non-canonical but understood ` +
        `(discoverable=${discoverable}, parseability=${parseabilityScore.toFixed(2)}, recoverableHierarchy=${recoverableHierarchy}).`,
      specId: inferredSpecId,
      sourcePaths: [sourcePath],
      remediationHint: "Keep adapter mode or move this file toward canonical naming and sections.",
    });
  }
}

function validateCanonicalRules(
  result: IngestResult,
  findings: ValidationFinding[],
): void {
  const diagnosticCodesBySourcePath = new Map<string, string[]>();
  for (const diagnostic of result.diagnostics) {
    const diagnosticCodes = diagnosticCodesBySourcePath.get(diagnostic.sourcePath) ?? [];
    diagnosticCodes.push(diagnostic.code);
    diagnosticCodesBySourcePath.set(diagnostic.sourcePath, diagnosticCodes);
  }
  const discoveredSpecPaths = new Set(result.discovery.discoveredSpecFiles);
  const firstNodeIndex = buildFirstNodeIndex(result.canonicalNodes);
  const duplicateNodeIndex = buildDuplicateNodeIndex(result.canonicalNodes);

  for (const [id, nodes] of duplicateNodeIndex.entries()) {
    if (nodes.length < 2) {
      continue;
    }

    addFinding(findings, {
      ruleId: "V-003",
      severity: "error",
      message: `Duplicate canonical ID detected for ${id}.`,
      specId: id,
      sourcePaths: nodes.map((node) => node.sourcePath),
      remediationHint: "Assign a unique stable ID to each spec item.",
    });
  }

  for (const node of result.canonicalNodes) {
    const expectedParentType = expectedParentTypeByChildType[node.type];
    const parent = node.parentId ? firstNodeIndex.get(node.parentId) : undefined;

    if (node.type !== "epic" && (!node.parentId || !parent)) {
      addFinding(findings, {
        ruleId: "V-001",
        severity: "error",
        message: `Item ${node.id} is missing a resolvable parent.`,
        specId: node.id,
        sourcePaths: [node.sourcePath],
        remediationHint: "Set Parent to an existing spec ID at the correct hierarchy level.",
      });
    }

    const reachesEpic = (() => {
      if (node.type === "epic") {
        return true;
      }

      const visited = new Set<string>([node.id]);
      let currentParentId = node.parentId;

      while (currentParentId) {
        if (visited.has(currentParentId)) {
          return false;
        }

        visited.add(currentParentId);
        const currentParent = firstNodeIndex.get(currentParentId);
        if (!currentParent) {
          return false;
        }

        if (currentParent.type === "epic") {
          return true;
        }

        currentParentId = currentParent.parentId;
      }

      return false;
    })();

    if (node.type !== "epic" && node.parentId && !reachesEpic) {
      addFinding(findings, {
        ruleId: "V-002",
        severity: "warning",
        message: `Item ${node.id} is disconnected from any epic lineage.`,
        specId: node.id,
        sourcePaths: [node.sourcePath],
        remediationHint: "Reconnect the item to a valid epic -> feature -> story -> task chain.",
      });
    }

    if ((node.type === "epic" && node.parentId) || (parent && expectedParentType && parent.type !== expectedParentType)) {
      addFinding(findings, {
        ruleId: "V-005",
        severity: "error",
        message: `Item ${node.id} violates the canonical parent-child hierarchy rules.`,
        specId: node.id,
        sourcePaths: [node.sourcePath, ...(parent ? [parent.sourcePath] : [])],
        remediationHint: "Move the item under the correct parent type for its spec type.",
      });
    }

    const missingFields: string[] = [];
    if (!node.id.trim()) {
      missingFields.push("ID");
    }
    if (!node.title.trim()) {
      missingFields.push("Title");
    }
    if (!node.summary.trim()) {
      missingFields.push("Summary");
    }
    if (!node.sourcePath.trim()) {
      missingFields.push("sourcePath");
    }

    for (const requiredSection of requiredFieldSectionsByType[node.type]) {
      if (requiredSection === "Summary") {
        continue;
      }

      if (requiredSection === "Goals" && (!node.goals || node.goals.length === 0)) {
        missingFields.push(requiredSection);
      }
      if (requiredSection === "Non-goals" && (!node.nonGoals || node.nonGoals.length === 0)) {
        missingFields.push(requiredSection);
      }
      if (requiredSection === "Requirements" && (!node.requirements || node.requirements.length === 0)) {
        missingFields.push(requiredSection);
      }
      if (
        requiredSection === "Acceptance Criteria" &&
        (!node.acceptanceCriteria || node.acceptanceCriteria.length === 0)
      ) {
        missingFields.push(requiredSection);
      }
    }

    if (missingFields.length > 0) {
      addFinding(findings, {
        ruleId: "V-006",
        severity: "error",
        message: `Item ${node.id} is missing required fields: ${missingFields.join(", ")}.`,
        specId: node.id,
        sourcePaths: [node.sourcePath],
        remediationHint: "Fill in the required sections for this spec type.",
      });
    }

    validatePathConventionRule(result, node, findings, diagnosticCodesBySourcePath, discoveredSpecPaths);
  }

  validateAdapterOnlyFileConventions(result, findings, diagnosticCodesBySourcePath, discoveredSpecPaths);
}

function mapParserDiagnosticsToFindings(
  diagnostics: ParserDiagnostic[],
  findings: ValidationFinding[],
): void {
  for (const diagnostic of diagnostics) {
    if (diagnostic.code === "invalid-or-missing-type") {
      addFinding(findings, {
        ruleId: "V-004",
        severity: "error",
        message: diagnostic.message,
        specId: diagnostic.specId,
        sourcePaths: [diagnostic.sourcePath],
        remediationHint: "Set Type to epic, feature, story, or task.",
      });
      continue;
    }

    if (diagnostic.code === "missing-parent" || (diagnostic.code === "missing-required-section" && diagnostic.sectionName === "Parent")) {
      addFinding(findings, {
        ruleId: "V-001",
        severity: "error",
        message: diagnostic.message,
        specId: diagnostic.specId,
        sourcePaths: [diagnostic.sourcePath],
        remediationHint: "Set Parent to an existing spec ID.",
      });
      continue;
    }

    if (diagnostic.code === "missing-title") {
      addFinding(findings, {
        ruleId: "V-006",
        severity: "error",
        message: diagnostic.message,
        specId: diagnostic.specId,
        sourcePaths: [diagnostic.sourcePath],
        remediationHint: "Add the missing required field or section.",
      });
      continue;
    }

    if (diagnostic.code === "missing-required-section" && diagnostic.sectionName !== "Parent") {
      addFinding(findings, {
        ruleId: "V-006",
        severity: "error",
        message: diagnostic.message,
        specId: diagnostic.specId,
        sourcePaths: [diagnostic.sourcePath],
        remediationHint: "Add the missing required field or section.",
      });
    }
  }
}

function mapCompositionDiagnosticsToFindings(
  diagnostics: CompositionDiagnostic[],
  findings: ValidationFinding[],
): void {
  for (const diagnostic of diagnostics) {
    if (diagnostic.code === "unknown-overlay-specid") {
      addFinding(findings, {
        ruleId: "V-101",
        severity: "warning",
        message: diagnostic.message,
        specId: diagnostic.specId,
        sourcePaths: [diagnostic.sourcePath],
        remediationHint: "Update the overlay entry to point at an existing spec ID.",
      });
      continue;
    }

    if (diagnostic.code === "invalid-overlay-entry" && diagnostic.sectionName === "planningStatus") {
      addFinding(findings, {
        ruleId: "V-102",
        severity: "error",
        message: diagnostic.message,
        specId: diagnostic.specId,
        sourcePaths: [diagnostic.sourcePath],
        remediationHint: "Use one of the supported planningStatus values.",
      });
      continue;
    }

    if (diagnostic.code === "invalid-overlay-entry" && diagnostic.sectionName === "rank") {
      addFinding(findings, {
        ruleId: "V-103",
        severity: "warning",
        message: diagnostic.message,
        specId: diagnostic.specId,
        sourcePaths: [diagnostic.sourcePath],
        remediationHint: "Set rank to a positive integer.",
      });
    }
  }
}

function validateOverlayDependencyReferences(
  result: IngestResult,
  findings: ValidationFinding[],
): void {
  const canonicalIds = new Set(result.canonicalNodes.map((node) => node.id));

  for (const overlayFile of result.overlayFiles) {
    for (const entry of overlayFile.entries) {
      for (const dependency of entry.dependencies ?? []) {
        if (canonicalIds.has(dependency)) {
          continue;
        }

        addFinding(findings, {
          ruleId: "V-104",
          severity: "warning",
          message: `Overlay dependency ${dependency} for ${entry.specId} does not resolve to a known spec.`,
          specId: entry.specId,
          sourcePaths: [overlayFile.sourcePath],
          remediationHint: "Update the dependency list to reference an existing spec ID.",
        });
      }
    }
  }
}

export function validateIngestResult(result: IngestResult): ValidationResult {
  const findings: ValidationFinding[] = [];

  validateCanonicalRules(result, findings);
  mapParserDiagnosticsToFindings(result.diagnostics, findings);
  mapCompositionDiagnosticsToFindings(result.compositionDiagnostics, findings);
  validateOverlayDependencyReferences(result, findings);

  const deduplicated = new Map<string, ValidationFinding>();
  for (const finding of findings) {
    const key = [
      finding.ruleId,
      finding.severity,
      finding.specId ?? "",
      finding.message,
      finding.sourcePaths.join("|"),
    ].join("::");
    if (!deduplicated.has(key)) {
      deduplicated.set(key, finding);
    }
  }

  const sortedFindings = Array.from(deduplicated.values()).sort(compareFindings);
  return {
    findings: sortedFindings,
    summary: summarizeFindings(sortedFindings),
    bootstrap: result.discovery.bootstrap,
  };
}

export async function validateRepository(
  repoPath: string,
  options: RepositoryAdapterOptions = {},
): Promise<ValidationResult> {
  const ingestResult = await ingestRepository(repoPath, options);
  return validateIngestResult(ingestResult);
}
