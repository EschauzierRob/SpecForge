export { ingestRepository } from "./core/ingest/ingest.ts";
export { discoverOverlayFiles, discoverRepository } from "./core/ingest/discovery.ts";
export { parseSpecFile, mapSectionsToCanonical } from "./core/parser/map.ts";
export { tokenizeSections } from "./core/parser/sections.ts";
export { buildOverlayIndex, composeNodes } from "./core/overlay/compose.ts";
export { loadOverlayFile } from "./core/overlay/loader.ts";
export type {
  CanonicalNode,
  ComposedNode,
  CompositionDiagnostic,
  IngestResult,
  OverlayEntry,
  OverlayFacet,
  OverlayFile,
  ParseSpecFileResult,
  ParsedSpecFile,
  PlanningStatus,
  ParserDiagnostic,
  RepositoryDiscovery,
  SectionMap,
  SpecNodeType,
} from "./core/model/types.ts";
