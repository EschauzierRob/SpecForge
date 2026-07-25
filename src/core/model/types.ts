export type SpecNodeType = "epic" | "feature" | "story" | "task";
export type PlanningStatus = "backlog" | "ready" | "in_progress" | "blocked" | "done";
export type ExecutionWorkType = "research" | "design" | "implementation" | "validation" | "documentation";
export type EvidenceAssessment = "passed" | "failed";
export type SliceResolution = "validated" | "disproved" | "killed";
export type BlockerStatus = "open" | "resolved";

export type DiagnosticSeverity = "error" | "warning" | "info";
export type InferenceStrategyId =
  | "naming"
  | "directory-adjacency"
  | "content-reference"
  | "heading-grammar"
  | "filename-grammar"
  | "cross-reference-grammar";
export type InferenceCandidateState = "selected" | "candidate" | "ambiguous" | "rejected";
export type InferenceRelationshipState = "explicit" | "inferred" | "ambiguous" | "unresolved";
export type InferenceVirtualType = "slice";
export type SpecDiscoveryAdapterProfile = "canonical" | "bitbetmatic2";

export interface RepositoryAdapterOptions {
  adapterProfile?: SpecDiscoveryAdapterProfile;
}

export interface ParserDiagnostic {
  severity: DiagnosticSeverity;
  code: string;
  message: string;
  sourcePath: string;
  specId?: string;
  sectionName?: string;
}

export interface RepositoryDiscovery {
  repoRoot: string;
  specsPath: string;
  overlayPath: string;
  cliTooling: SpecForgeCliToolingStatus;
  specDiscoveryProfile: SpecDiscoveryAdapterProfile;
  validationProfile: SpecDiscoveryAdapterProfile;
  hasOverlayDirectory: boolean;
  discoveredSpecFiles: string[];
  adapterIncludedSpecFiles: string[];
  discoveredOverlayFiles: string[];
  specFileCount: number;
  overlayFileCount: number;
  ignoredEntries: string[];
  missingExpectedDirectories: string[];
  bootstrap: WorkspaceBootstrapSummary;
}

export interface WorkspaceBootstrapAction {
  kind: "directory" | "file";
  path: string;
  operation?: "updated" | "skipped";
  reason?: string;
}

export interface WorkspaceBootstrapSummary {
  actions: WorkspaceBootstrapAction[];
  createdCount: number;
  updatedCount?: number;
  skippedCount?: number;
}

export type SpecForgeCliToolingAvailability =
  | "available"
  | "missing"
  | "partial"
  | "outdated"
  | "customized";

export interface SpecForgeCliToolingStatus {
  status: SpecForgeCliToolingAvailability;
  launchers: string[];
  runtimePath?: string;
  manifestPath?: string;
  version?: string;
}

export interface SectionToken {
  name: string;
  rawName: string;
  content: string;
}

export interface SectionMap {
  order: string[];
  sections: Record<string, string>;
  rawSections: Record<string, string>;
  sectionOffsets: Record<string, SectionOffset>;
}

export interface SectionOffset {
  startLine: number;
  endLine: number;
}

export interface NormalizedDecisionRecord {
  sourcePath: string;
  sectionName: string;
  sectionOffset: SectionOffset;
  decisionId?: string;
  decision: string;
  reason?: string;
}

export interface CanonicalParserMetadata {
  sectionOrder: string[];
  unknownSections: Record<string, string>;
  normalizedDecisions?: NormalizedDecisionRecord[];
  fallbackExtraction?: {
    title?: string;
    summary?: string;
    candidateMarkers: string[];
  };
}

export interface CanonicalNode {
  id: string;
  type: SpecNodeType;
  title: string;
  summary: string;
  sourcePath: string;
  parentId?: string;
  childrenIds: string[];
  problemContext?: string;
  goals?: string[];
  nonGoals?: string[];
  requirements?: string[];
  acceptanceCriteria?: string[];
  dependencies?: string[];
  openQuestions?: string[];
  notes?: string;
  description?: string;
  assumptions?: string[];
  risks?: string[];
  constraints?: string[];
  scenarios?: string[];
  technicalNotes?: string[];
  definitionOfDone?: string[];
  parserMetadata?: CanonicalParserMetadata;
}

export interface InferenceEvidence {
  strategyId: InferenceStrategyId;
  source: string;
  matchedSignal: string;
  weight: number;
  details: Record<string, string | number | boolean | string[]>;
}

export interface InferenceCandidate {
  key: string;
  parentId: string;
  parentSourcePath: string;
  state: InferenceCandidateState;
  supportScore: number;
  evidence: InferenceEvidence[];
}

export interface InferenceRelationship {
  key: string;
  childId: string;
  childSourcePath: string;
  explicitParentId?: string;
  selectedParentId?: string;
  state: InferenceRelationshipState;
  candidates: InferenceCandidate[];
}

export interface InferenceResult {
  relationships: InferenceRelationship[];
  virtualNodes?: InferenceVirtualNode[];
}

export interface InferenceVirtualNode {
  id: string;
  sourcePath: string;
  title: string;
  parentId: string;
  virtualType: InferenceVirtualType;
  projectedType: SpecNodeType;
  evidence: InferenceEvidence[];
}

export interface ParsedSpecFile {
  title?: string;
  sectionMap: SectionMap;
  sourcePath: string;
  rawContent?: string;
}

export interface ParseSpecFileResult {
  node?: CanonicalNode;
  diagnostics: ParserDiagnostic[];
}

export interface CompositionDiagnostic {
  severity: DiagnosticSeverity;
  code: string;
  message: string;
  sourcePath: string;
  specId?: string;
  sectionName?: string;
}

export interface OverlayEntry {
  specId: string;
  planningStatus?: PlanningStatus;
  rank?: number;
  blocked?: boolean;
  blockedReason?: string;
  dependencies?: string[];
  notes?: string;
  tags?: string[];
}

export interface SliceCriterion {
  criterionId: string;
  description: string;
  met: boolean;
  evidenceIds?: string[];
}

export interface SliceScope {
  included: string[];
  excluded: string[];
}

export interface ExecutionWorkItem {
  workId: string;
  specId: string;
  type: ExecutionWorkType;
  description: string;
}

export interface RequiredEvidence {
  evidenceId: string;
  description: string;
}

export interface ExternalEvidenceProvenance {
  repository: string;
  commit: string;
  branch?: string;
  artifactPath: string;
  observedAt: string;
  consumerVerified: boolean;
}

export interface ObservedEvidence {
  evidenceId: string;
  description: string;
  satisfies: string[];
  assessment: EvidenceAssessment;
  artifactPath?: string;
  command?: string;
  observedAt?: string;
  provenance?: ExternalEvidenceProvenance;
}

export interface SliceDecision {
  decisionId: string;
  decision: string;
  reason?: string;
  decidedAt?: string;
}

export interface SliceBlocker {
  blockerId: string;
  description: string;
  status: BlockerStatus;
}

export interface ExecutionSlice {
  sliceId: string;
  title: string;
  planningStatus: PlanningStatus;
  resolution?: SliceResolution;
  linkedSpecIds: string[];
  objective: string;
  hypothesis?: string;
  entryCriteria: SliceCriterion[];
  scope: SliceScope;
  work: ExecutionWorkItem[];
  exitCriteria: SliceCriterion[];
  requiredEvidence: RequiredEvidence[];
  observedEvidence: ObservedEvidence[];
  killCriteria: string[];
  dependencySliceIds: string[];
  decisions: SliceDecision[];
  blockers: SliceBlocker[];
  nextAction: string;
}

export interface OverlayFile {
  sourcePath: string;
  version: string;
  repositoryId: string;
  entries: OverlayEntry[];
  executionSlices: ExecutionSlice[];
}

export interface OverlayFacet extends OverlayEntry {
  sourcePath: string;
  repositoryId: string;
}

export interface ComposedNode {
  spec: CanonicalNode;
  overlay?: OverlayFacet;
}

export interface ValidationFinding {
  ruleId: string;
  severity: DiagnosticSeverity;
  message: string;
  sourcePaths: string[];
  specId?: string;
  sliceId?: string;
  remediationHint?: string;
}

export interface ValidationSummary {
  total: number;
  bySeverity: Record<DiagnosticSeverity, number>;
  byRuleId: Record<string, number>;
}

export interface ValidationResult {
  findings: ValidationFinding[];
  summary: ValidationSummary;
  bootstrap: WorkspaceBootstrapSummary;
}

export type RecommendationReasonCode =
  | "included_ready_status"
  | "included_rank_present"
  | "included_default_rank"
  | "included_no_dependencies"
  | "included_all_dependencies_resolved"
  | "included_story_work_unit"
  | "included_fallback_work_unit"
  | "included_priority_path"
  | "included_ancestor_dependency_ignored"
  | "excluded_planning_status_done"
  | "excluded_blocked"
  | "excluded_unresolved_dependencies"
  | "excluded_missing_dependency_node"
  | "excluded_validation_dependency_warning"
  | "excluded_container_with_unfinished_descendants"
  | "excluded_task_under_unfinished_story";

export interface RecommendationRationale {
  reasonCodes: RecommendationReasonCode[];
  summary: string;
  topScoreFactors: string[];
}

export interface RecommendationEvaluation {
  specId: string;
  specTitle: string;
  specType: SpecNodeType;
  eligible: boolean;
  score: number;
  rankValue: number;
  planningStatus: PlanningStatus | "unspecified";
  unresolvedDependencies: string[];
  priorityPath: string[];
  ignoredAncestorDependencies: string[];
  unfinishedDescendantIds: string[];
  rationale: RecommendationRationale;
}

export interface RecommendationItem extends RecommendationEvaluation {
  eligible: true;
}

export interface RecommendationResult {
  recommendations: RecommendationItem[];
  evaluations: RecommendationEvaluation[];
}

export interface ParseRepositoryResult {
  discovery: RepositoryDiscovery;
  canonicalNodes: CanonicalNode[];
  diagnostics: ParserDiagnostic[];
  inference?: InferenceResult;
}

export interface ComposeRepositoryResult {
  discovery: RepositoryDiscovery;
  canonicalNodes: CanonicalNode[];
  overlayFiles: OverlayFile[];
  composedNodes: ComposedNode[];
  diagnostics: ParserDiagnostic[];
  compositionDiagnostics: CompositionDiagnostic[];
  inference?: InferenceResult;
}

export interface IngestResult {
  discovery: RepositoryDiscovery;
  canonicalNodes: CanonicalNode[];
  overlayFiles: OverlayFile[];
  composedNodes: ComposedNode[];
  diagnostics: ParserDiagnostic[];
  compositionDiagnostics: CompositionDiagnostic[];
  inference?: InferenceResult;
}
