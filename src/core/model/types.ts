export type SpecNodeType = "epic" | "feature" | "story" | "task";

export type DiagnosticSeverity = "error" | "warning" | "info";

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
  specFileCount: number;
  ignoredEntries: string[];
  missingExpectedDirectories: string[];
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

export interface ParsedSpecFile {
  title?: string;
  sectionMap: SectionMap;
  sourcePath: string;
}

export interface ParseSpecFileResult {
  node?: CanonicalNode;
  diagnostics: ParserDiagnostic[];
}

export interface IngestResult {
  discovery: RepositoryDiscovery;
  canonicalNodes: CanonicalNode[];
  diagnostics: ParserDiagnostic[];
}
