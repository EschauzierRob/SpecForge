import type { RepositoryAdapterOptions } from "../../model/types.ts";
import { bitbetmatic2RepositoryAdapter } from "./bitbetmatic2.ts";
import { canonicalRepositoryAdapter } from "./canonical.ts";
import type { RepositoryAdapterResolution } from "./types.ts";

export function resolveRepositoryAdapter(options: RepositoryAdapterOptions = {}): RepositoryAdapterResolution {
  const profile = options.adapterProfile ?? "canonical";

  if (profile === "bitbetmatic2") {
    return { adapter: bitbetmatic2RepositoryAdapter, options };
  }

  return { adapter: canonicalRepositoryAdapter, options };
}
