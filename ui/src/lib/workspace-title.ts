const DEFAULT_DOCUMENT_TITLE = "SpecForge";

function getRepositoryName(repoPath: string): string | undefined {
  const normalizedPath = repoPath.trim().replace(/[\\/]+$/, "");
  const segments = normalizedPath.split(/[\\/]+/).filter(Boolean);
  const repositoryName = segments.at(-1);

  return repositoryName && repositoryName !== "." && repositoryName !== ".." ? repositoryName : undefined;
}

export function getWorkspaceDocumentTitle(repoPath: string | undefined): string {
  const repositoryName = repoPath ? getRepositoryName(repoPath) : undefined;

  return repositoryName ? `${DEFAULT_DOCUMENT_TITLE} - ${repositoryName}` : DEFAULT_DOCUMENT_TITLE;
}
