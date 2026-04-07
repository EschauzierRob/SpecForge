import type { IngestResult } from "../model/types.ts";
import { composeRepository } from "./compose.ts";

export async function ingestRepository(repoPath: string): Promise<IngestResult> {
  return composeRepository(repoPath);
}
