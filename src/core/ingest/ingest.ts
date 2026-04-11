import type { IngestResult, RepositoryAdapterOptions } from "../model/types.ts";
import { composeRepository } from "./compose.ts";

export async function ingestRepository(
  repoPath: string,
  options: RepositoryAdapterOptions = {},
): Promise<IngestResult> {
  return composeRepository(repoPath, options);
}
