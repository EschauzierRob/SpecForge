import assert from "node:assert/strict";
import test from "node:test";

import {
  getBlockedReason,
  getOverviewCounts,
  getPlanningStatusCounts,
  getSelectedComposedNode,
} from "../ui/src/lib/selectors.ts";
import type {
  ComposeRepositoryResult,
  UiWorkspaceState,
  ValidationResult,
} from "../ui/src/lib/contracts.ts";
import {
  initialWorkspaceState,
  toParseResult,
  workspaceReducer,
} from "../ui/src/lib/workspace-state.ts";

const composeFixture: ComposeRepositoryResult = {
  discovery: {
    repoRoot: "C:/repo",
    specsPath: "specs",
    overlayPath: "specforge/overlay",
    hasOverlayDirectory: true,
    discoveredSpecFiles: ["specs/epic-0001-foundation/epic.md"],
    discoveredOverlayFiles: ["specforge/overlay/local.overlay.json"],
    specFileCount: 1,
    overlayFileCount: 1,
    ignoredEntries: [],
    missingExpectedDirectories: [],
  },
  canonicalNodes: [
    {
      id: "epic-0001",
      type: "epic",
      title: "Foundation",
      summary: "Set up the foundation.",
      sourcePath: "specs/epic-0001-foundation/epic.md",
      childrenIds: ["feature-0001"],
      goals: ["Ship an MVP"],
      nonGoals: ["Editing specs in-browser"],
    },
    {
      id: "feature-0001",
      type: "feature",
      title: "Canonical spec model",
      summary: "Define canonical structure.",
      sourcePath: "specs/epic-0001-foundation/feature-0001-canonical-spec-model.md",
      parentId: "epic-0001",
      childrenIds: [],
      requirements: ["Parse markdown"],
    },
    {
      id: "story-0001",
      type: "story",
      title: "Display board urgency pill",
      summary: "Keep blocked as card-level urgency state.",
      sourcePath: "specs/epic-0001-foundation/story-0001-display-board-urgency-pill.md",
      parentId: "feature-0001",
      childrenIds: [],
      acceptanceCriteria: ["Show blocked marker on board cards"],
    },
  ],
  overlayFiles: [
    {
      sourcePath: "specforge/overlay/local.overlay.json",
      version: "1.0",
      repositoryId: "local-dev",
      entries: [
        {
          specId: "feature-0001",
          planningStatus: "ready",
          rank: 1,
        },
        {
          specId: "story-0001",
          planningStatus: "blocked",
          blocked: true,
          rank: 2,
        },
      ],
    },
  ],
  composedNodes: [
    {
      spec: {
        id: "epic-0001",
        type: "epic",
        title: "Foundation",
        summary: "Set up the foundation.",
        sourcePath: "specs/epic-0001-foundation/epic.md",
        childrenIds: ["feature-0001"],
        goals: ["Ship an MVP"],
        nonGoals: ["Editing specs in-browser"],
      },
    },
    {
      spec: {
        id: "feature-0001",
        type: "feature",
        title: "Canonical spec model",
        summary: "Define canonical structure.",
        sourcePath: "specs/epic-0001-foundation/feature-0001-canonical-spec-model.md",
        parentId: "epic-0001",
        childrenIds: [],
        requirements: ["Parse markdown"],
      },
      overlay: {
        specId: "feature-0001",
        planningStatus: "ready",
        rank: 1,
        sourcePath: "specforge/overlay/local.overlay.json",
        repositoryId: "local-dev",
      },
    },
    {
      spec: {
        id: "story-0001",
        type: "story",
        title: "Display board urgency pill",
        summary: "Keep blocked as card-level urgency state.",
        sourcePath: "specs/epic-0001-foundation/story-0001-display-board-urgency-pill.md",
        parentId: "feature-0001",
        childrenIds: [],
        acceptanceCriteria: ["Show blocked marker on board cards"],
      },
      overlay: {
        specId: "story-0001",
        planningStatus: "blocked",
        blocked: true,
        rank: 2,
        sourcePath: "specforge/overlay/local.overlay.json",
        repositoryId: "local-dev",
      },
    },
  ],
  diagnostics: [
    {
      severity: "warning",
      code: "unknown-section",
      message: "Unknown section ignored.",
      sourcePath: "specs/epic-0001-foundation/epic.md",
    },
  ],
  compositionDiagnostics: [
    {
      severity: "info",
      code: "overlay-loaded",
      message: "Loaded overlay file.",
      sourcePath: "specforge/overlay/local.overlay.json",
    },
  ],
};

const validationFixture: ValidationResult = {
  findings: [
    {
      ruleId: "V-101",
      severity: "warning",
      message: "Unknown overlay spec ID.",
      sourcePaths: ["specforge/overlay/local.overlay.json"],
      specId: "feature-9999",
    },
  ],
  summary: {
    total: 1,
    bySeverity: {
      error: 0,
      warning: 1,
      info: 0,
    },
    byRuleId: {
      "V-101": 1,
    },
  },
};

test("context loading prefills the repo path only when empty", () => {
  const firstState = workspaceReducer(initialWorkspaceState, {
    type: "contextLoaded",
    repoPath: "C:/repo",
  });

  assert.equal(firstState.repoPath, "C:/repo");

  const secondState = workspaceReducer(
    {
      ...firstState,
      repoPath: "D:/custom",
    },
    {
      type: "contextLoaded",
      repoPath: "C:/repo",
    },
  );

  assert.equal(secondState.repoPath, "D:/custom");
});

test("load success stores compose and validation payloads and selects the first item", () => {
  const state = workspaceReducer(initialWorkspaceState, {
    type: "loadSucceeded",
    repoPath: "C:/repo",
    parseResult: toParseResult(composeFixture),
    composeResult: composeFixture,
    validationResult: validationFixture,
  });

  assert.equal(state.loadState, "success");
  assert.equal(state.selectedItemId, "epic-0001");
  assert.equal(state.composeResult?.composedNodes.length, 3);
  assert.equal(state.validationResult?.summary.total, 1);
});

test("screen changes persist across successful reloads when data stays in memory", () => {
  const stateAfterScreenChange = workspaceReducer(
    {
      ...initialWorkspaceState,
      activeScreen: "Overview",
    },
    {
      type: "screenChanged",
      screen: "Warnings",
    },
  );

  const finalState = workspaceReducer(stateAfterScreenChange, {
    type: "loadSucceeded",
    repoPath: "C:/repo",
    parseResult: toParseResult(composeFixture),
    composeResult: composeFixture,
    validationResult: validationFixture,
  });

  assert.equal(finalState.activeScreen, "Warnings");
});

test("selected item is preserved across reloads when it still exists", () => {
  const existingState: UiWorkspaceState = {
    ...initialWorkspaceState,
    selectedItemId: "feature-0001",
  };

  const nextState = workspaceReducer(existingState, {
    type: "loadSucceeded",
    repoPath: "C:/repo",
    parseResult: toParseResult(composeFixture),
    composeResult: composeFixture,
    validationResult: validationFixture,
  });

  assert.equal(nextState.selectedItemId, "feature-0001");
});

test("load failure keeps the shell stable and exposes the error message", () => {
  const state = workspaceReducer(
    {
      ...initialWorkspaceState,
      activeScreen: "Board",
      loadState: "loading",
    },
    {
      type: "loadFailed",
      message: "Repository path was invalid.",
    },
  );

  assert.equal(state.activeScreen, "Board");
  assert.equal(state.loadState, "error");
  assert.equal(state.errorMessage, "Repository path was invalid.");
});

test("overview selectors summarize compose and validation data", () => {
  const counts = getOverviewCounts(composeFixture, validationFixture);

  assert.equal(counts.specCount, 3);
  assert.equal(counts.overlayFileCount, 1);
  assert.equal(counts.composedNodeCount, 3);
  assert.equal(counts.parserDiagnostics.warning, 1);
  assert.equal(counts.compositionDiagnostics.info, 1);
  assert.equal(counts.validationFindings.total, 1);
});

test("planning status selector keeps blocked as card urgency while counting status lanes", () => {
  const counts = getPlanningStatusCounts(composeFixture);

  assert.equal(counts.ready, 1);
  assert.equal(counts.in_progress, 1);
  assert.equal(counts.blocked, 0);
  assert.equal(counts.unplanned, 1);
});

test("blocked reason selector prefers explicit reason, then notes, then default fallback", () => {
  const explicit = getBlockedReason({
    spec: composeFixture.composedNodes[2].spec,
    overlay: {
      ...composeFixture.composedNodes[2].overlay,
      blocked: true,
      blockedReason: "Blocked by dependency freeze",
      notes: "Legacy fallback note",
    },
  });
  assert.equal(explicit, "Blocked by dependency freeze");

  const fromNotes = getBlockedReason({
    spec: composeFixture.composedNodes[2].spec,
    overlay: {
      ...composeFixture.composedNodes[2].overlay,
      blocked: true,
      notes: "Waiting for QA environment",
    },
  });
  assert.equal(fromNotes, "Waiting for QA environment");

  const fallback = getBlockedReason({
    spec: composeFixture.composedNodes[2].spec,
    overlay: {
      ...composeFixture.composedNodes[2].overlay,
      blocked: true,
      notes: "   ",
      blockedReason: " ",
    },
  });
  assert.equal(fallback, "No blocker reason provided.");
});

test("selected node lookup resolves the currently selected composed node", () => {
  const selectedNode = getSelectedComposedNode(composeFixture, "feature-0001");

  assert.equal(selectedNode?.spec.title, "Canonical spec model");
  assert.equal(selectedNode?.overlay?.planningStatus, "ready");
});
