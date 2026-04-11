import type {
  CanonicalNode,
  InferenceResult,
  ParseSpecFileResult,
  RepositoryDiscovery,
  RepositoryAdapterOptions,
  SpecDiscoveryAdapterProfile,
} from "../../model/types.ts";

export interface SpecFileAcceptanceResult {
  include: boolean;
  adapterOnly: boolean;
}

export interface RepositoryAdapter {
  profile: SpecDiscoveryAdapterProfile;
  discoverCandidates(relativePath: string): SpecFileAcceptanceResult;
  parseArtifact(absolutePath: string, repoRoot: string): Promise<ParseSpecFileResult>;
  inferRelationships(input: {
    discovery: RepositoryDiscovery;
    parseResultsBySourcePath: Map<string, ParseSpecFileResult>;
    parsedNodes: CanonicalNode[];
  }): InferenceResult | undefined;
  validationProfile(): SpecDiscoveryAdapterProfile;
}

export interface RepositoryAdapterResolution {
  adapter: RepositoryAdapter;
  options: RepositoryAdapterOptions;
}
