import type {
  ComposeRepositoryResult,
  ParseRepositoryResult,
  UiScreen,
  UiWorkspaceState,
  ValidationResult,
} from "./contracts";

export type UiWorkspaceAction =
  | { type: "contextLoaded"; repoPath: string }
  | { type: "repoPathChanged"; repoPath: string }
  | { type: "screenChanged"; screen: UiScreen }
  | { type: "itemSelected"; specId?: string }
  | { type: "loadStarted" }
  | {
    type: "loadSucceeded";
    repoPath: string;
    parseResult: ParseRepositoryResult;
    composeResult: ComposeRepositoryResult;
    validationResult: ValidationResult;
  }
  | { type: "loadFailed"; message: string };

export const initialWorkspaceState: UiWorkspaceState = {
  repoPath: "",
  activeScreen: "Overview",
  loadState: "idle",
};

function getNextSelectedItemId(
  currentSelectedItemId: string | undefined,
  composeResult: ComposeRepositoryResult,
): string | undefined {
  if (currentSelectedItemId && composeResult.composedNodes.some((node) => node.spec.id === currentSelectedItemId)) {
    return currentSelectedItemId;
  }

  return composeResult.composedNodes[0]?.spec.id;
}

export function toParseResult(composeResult: ComposeRepositoryResult): ParseRepositoryResult {
  return {
    discovery: composeResult.discovery,
    canonicalNodes: composeResult.canonicalNodes,
    diagnostics: composeResult.diagnostics,
  };
}

export function workspaceReducer(
  state: UiWorkspaceState,
  action: UiWorkspaceAction,
): UiWorkspaceState {
  if (action.type === "contextLoaded") {
    if (state.repoPath.trim().length > 0) {
      return state;
    }

    return {
      ...state,
      repoPath: action.repoPath,
    };
  }

  if (action.type === "repoPathChanged") {
    return {
      ...state,
      repoPath: action.repoPath,
    };
  }

  if (action.type === "screenChanged") {
    return {
      ...state,
      activeScreen: action.screen,
    };
  }

  if (action.type === "itemSelected") {
    return {
      ...state,
      selectedItemId: action.specId,
    };
  }

  if (action.type === "loadStarted") {
    return {
      ...state,
      loadState: "loading",
      errorMessage: undefined,
    };
  }

  if (action.type === "loadSucceeded") {
    return {
      ...state,
      repoPath: action.repoPath,
      parseResult: action.parseResult,
      composeResult: action.composeResult,
      validationResult: action.validationResult,
      loadState: "success",
      errorMessage: undefined,
      selectedItemId: getNextSelectedItemId(state.selectedItemId, action.composeResult),
    };
  }

  return {
    ...state,
    loadState: "error",
    errorMessage: action.message,
  };
}
