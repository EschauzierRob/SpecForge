import type { UiScreen } from "./contracts";

export interface WorkspaceUrlState {
  repoPath?: string;
  activeScreen: UiScreen;
  selectedItemId?: string;
}

const screenByUrlValue: Record<string, UiScreen> = {
  overview: "Overview",
  tree: "Tree",
  board: "Board",
  slices: "Slices",
  detail: "Detail",
  warnings: "Warnings",
  "next-work": "Next Work",
};

const urlValueByScreen: Record<UiScreen, string> = {
  Overview: "overview",
  Tree: "tree",
  Board: "board",
  Slices: "slices",
  Detail: "detail",
  Warnings: "warnings",
  "Next Work": "next-work",
};

function optionalValue(value: string | null): string | undefined {
  return value && value.trim().length > 0 ? value : undefined;
}

export function readWorkspaceUrlState(url: string): WorkspaceUrlState {
  const parsedUrl = new URL(url);
  const tab = parsedUrl.searchParams.get("tab");

  return {
    repoPath: optionalValue(parsedUrl.searchParams.get("repo")),
    activeScreen: tab ? screenByUrlValue[tab] ?? "Overview" : "Overview",
    selectedItemId: optionalValue(parsedUrl.searchParams.get("item")),
  };
}

/**
 * Updates only SpecForge's workspace parameters and deliberately preserves
 * unrelated query parameters such as a deployment or analytics marker.
 */
export function createWorkspaceUrl(url: string, state: WorkspaceUrlState): string {
  const parsedUrl = new URL(url);
  const { searchParams } = parsedUrl;

  searchParams.delete("repo");
  searchParams.delete("tab");
  searchParams.delete("item");

  if (state.repoPath?.trim()) {
    searchParams.set("repo", state.repoPath);
  }

  searchParams.set("tab", urlValueByScreen[state.activeScreen]);

  if (state.selectedItemId?.trim()) {
    searchParams.set("item", state.selectedItemId);
  }

  return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
}
