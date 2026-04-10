export { composeRepository } from "./core/ingest/compose.ts";
export { discoverOverlayFiles, discoverRepository } from "./core/ingest/discovery.ts";
export { ingestRepository } from "./core/ingest/ingest.ts";
export { parseRepository } from "./core/ingest/parse.ts";
export { parseSpecFile, mapSectionsToCanonical } from "./core/parser/map.ts";
export { tokenizeSections } from "./core/parser/sections.ts";
export { buildOverlayIndex, composeNodes } from "./core/overlay/compose.ts";
export { loadOverlayFile } from "./core/overlay/loader.ts";
export { rankRecommendedNextWork } from "./core/recommendation/engine.ts";
export { createSpecForgeApiServer, startSpecForgeApiServer } from "./server.ts";
export { validateIngestResult, validateRepository } from "./core/validation/engine.ts";
export type {
  ApiServerHandle,
  ApiServerOptions,
  CanonicalNode,
  ComposeRepositoryResult,
  ComposedNode,
  CompositionDiagnostic,
  IngestResult,
  OverlayEntry,
  OverlayFacet,
  OverlayFile,
  ParseRepositoryResult,
  ParseSpecFileResult,
  ParsedSpecFile,
  PlanningStatus,
  ParserDiagnostic,
  RepositoryDiscovery,
  RecommendationEvaluation,
  RecommendationItem,
  RecommendationRationale,
  RecommendationReasonCode,
  RecommendationResult,
  SectionMap,
  SpecNodeType,
  ValidationFinding,
  ValidationResult,
  ValidationSummary,
} from "./core/model/types.ts";
