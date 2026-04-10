import type {
  ApiContext,
  ComposeRepositoryResult,
  ParseRepositoryResult,
  RecommendationResult,
  ValidationResult,
} from "./contracts";

interface ApiErrorPayload {
  error?: {
    message?: string;
  };
}

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const payload = await response.json() as ApiErrorPayload;
      if (payload.error?.message) {
        message = payload.error.message;
      }
    } catch {
      // Ignore secondary parsing failures and keep the fallback message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function fetchContext(): Promise<ApiContext> {
  return requestJson<ApiContext>("/api/context");
}

function postRepoPath<T>(endpoint: string, repoPath: string): Promise<T> {
  return requestJson<T>(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ repoPath }),
  });
}

export function fetchParse(repoPath: string): Promise<ParseRepositoryResult> {
  return postRepoPath<ParseRepositoryResult>("/api/parse", repoPath);
}

export function fetchCompose(repoPath: string): Promise<ComposeRepositoryResult> {
  return postRepoPath<ComposeRepositoryResult>("/api/compose", repoPath);
}

export function fetchValidate(repoPath: string): Promise<ValidationResult> {
  return postRepoPath<ValidationResult>("/api/validate", repoPath);
}

export function fetchRecommendations(repoPath: string): Promise<RecommendationResult> {
  return postRepoPath<RecommendationResult>("/api/recommend", repoPath);
}
