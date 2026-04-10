export type SpecNodeType = "epic" | "feature" | "story" | "task";
export type PlanningStatus = "backlog" | "ready" | "in_progress" | "blocked" | "done";
export type DiagnosticSeverity = "error" | "warning" | "info";
export type UiLoadState = "idle" | "loading" | "success" | "error";
export type UiScreen = "Overview" | "Tree" | "Board" | "Detail" | "Warnings" | "Next Work";

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
  hasOverlayDirectory: boolean;
  discoveredSpecFiles: string[];
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
}

export interface WorkspaceBootstrapSummary {
  actions: WorkspaceBootstrapAction[];
  createdCount: number;
}

export interface CanonicalParserMetadata {
  sectionOrder: string[];
  unknownSections: Record<string, string>;
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

export interface OverlayFile {
  sourcePath: string;
  version: string;
  repositoryId: string;
  entries: OverlayEntry[];
}

export interface OverlayFacet extends OverlayEntry {
  sourcePath: string;
  repositoryId: string;
}

export interface ComposedNode {
  spec: CanonicalNode;
  overlay?: OverlayFacet;
}

export interface CompositionDiagnostic {
  severity: DiagnosticSeverity;
  code: string;
  message: string;
  sourcePath: string;
  specId?: string;
  sectionName?: string;
}

export interface ValidationFinding {
  ruleId: string;
  severity: DiagnosticSeverity;
  message: string;
  sourcePaths: string[];
  specId?: string;
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
}

export interface ComposeRepositoryResult {
  discovery: RepositoryDiscovery;
  canonicalNodes: CanonicalNode[];
  overlayFiles: OverlayFile[];
  composedNodes: ComposedNode[];
  diagnostics: ParserDiagnostic[];
  compositionDiagnostics: CompositionDiagnostic[];
}

export interface ApiContext {
  defaultRepoPath: string;
}

export interface UiWorkspaceState {
  repoPath: string;
  activeScreen: UiScreen;
  selectedItemId?: string;
  parseResult?: ParseRepositoryResult;
  composeResult?: ComposeRepositoryResult;
  validationResult?: ValidationResult;
  recommendationResult?: RecommendationResult;
  loadState: UiLoadState;
  errorMessage?: string;
}
