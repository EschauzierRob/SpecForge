import assert from "node:assert/strict";
import test from "node:test";

import {
  filterValidationFindings,
  filterBoardNodes,
  BOARD_ITEM_TYPES,
  createBoardFilters,
  getBoardModel,
  getFindingNavigationSpecId,
  getWarningsEmptyState,
  getBlockedReason,
  getDependencyCount,
  getExecutionSlices,
  getOverviewCounts,
  getPlanningStatusCounts,
  getSelectedComposedNode,
  getTriageBadges,
} from "../ui/src/lib/selectors.ts";
import type {
  ComposeRepositoryResult,
  ComposedNode,
  PlanningStatus,
  SpecNodeType,
  RecommendationResult,
  UiWorkspaceState,
  ValidationResult,
} from "../ui/src/lib/contracts.ts";
import {
  initialWorkspaceState,
  toParseResult,
  workspaceReducer,
} from "../ui/src/lib/workspace-state.ts";
import {
  createWorkspaceUrl,
  readWorkspaceUrlState,
} from "../ui/src/lib/workspace-url-state.ts";
import { getWorkspaceDocumentTitle } from "../ui/src/lib/workspace-title.ts";

const composeFixture: ComposeRepositoryResult = {
  discovery: {
    repoRoot: "C:/repo",
    specsPath: "specs",
    overlayPath: "specforge/overlay",
    specDiscoveryProfile: "canonical",
    validationProfile: "canonical",
    hasOverlayDirectory: true,
    discoveredSpecFiles: ["specs/epic-0001-foundation/epic.md"],
    adapterIncludedSpecFiles: [],
    discoveredOverlayFiles: ["specforge/overlay/local.overlay.json"],
    specFileCount: 1,
    overlayFileCount: 1,
    ignoredEntries: [],
    missingExpectedDirectories: [],
    bootstrap: {
      actions: [],
      createdCount: 0,
    },
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
      executionSlices: [],
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
  bootstrap: {
    actions: [],
    createdCount: 0,
  },
};

const recommendationFixture: RecommendationResult = {
  recommendations: [
    {
      specId: "feature-0001",
      specTitle: "Canonical spec model",
      specType: "feature",
      eligible: true,
      score: 1,
      rankValue: 1,
      planningStatus: "ready",
      unresolvedDependencies: [],
      priorityPath: ["epic-0001", "feature-0001"],
      ignoredAncestorDependencies: [],
      unfinishedDescendantIds: [],
      rationale: {
        reasonCodes: ["included_fallback_work_unit", "included_priority_path", "included_ready_status", "included_rank_present"],
        summary: "Included feature-0001 as a feature work unit based on status (ready), rank (1), and priority path (epic-0001 > feature-0001).",
        topScoreFactors: ["feature fallback work unit", "priority path epic-0001 > feature-0001", "ready status", "rank=1"],
      },
    },
  ],
  evaluations: [],
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

test("workspace URL state restores an encoded repository, tab, and selected item", () => {
  const state = readWorkspaceUrlState(
    "http://localhost:4173/?repo=C%3A%5CCode%5CSpecForge%5CRepo%5CSpecForge&tab=next-work&item=S-0202",
  );

  assert.deepEqual(state, {
    repoPath: "C:\\Code\\SpecForge\\Repo\\SpecForge",
    activeScreen: "Next Work",
    selectedItemId: "S-0202",
  });
});

test("workspace URL state falls back to Overview for a missing or unknown tab", () => {
  assert.equal(readWorkspaceUrlState("http://localhost:4173/?repo=C%3A%2Frepo").activeScreen, "Overview");
  assert.equal(readWorkspaceUrlState("http://localhost:4173/?tab=timeline").activeScreen, "Overview");
});

test("workspace URL serialization preserves unrelated query parameters", () => {
  const url = createWorkspaceUrl("http://localhost:4173/?source=bookmark&tab=tree&item=old", {
    repoPath: "C:\\Code\\SpecForge\\Repo\\SpecForge",
    activeScreen: "Detail",
    selectedItemId: "F-0026",
  });

  assert.equal(
    url,
    "/?source=bookmark&repo=C%3A%5CCode%5CSpecForge%5CRepo%5CSpecForge&tab=detail&item=F-0026",
  );
});

test("workspace document title uses the loaded repository's final path node", () => {
  assert.equal(
    getWorkspaceDocumentTitle("C:\\Code\\BitBetMatic 2.0\\Repo\\BitBetMatic_2.0"),
    "SpecForge UI - BitBetMatic_2.0",
  );
  assert.equal(getWorkspaceDocumentTitle("/projects/specforge/"), "SpecForge UI - specforge");
  assert.equal(getWorkspaceDocumentTitle(undefined), "SpecForge UI");
});

test("load success stores compose and validation payloads and selects the first item", () => {
  const state = workspaceReducer(initialWorkspaceState, {
    type: "loadSucceeded",
    repoPath: "C:/repo",
    parseResult: toParseResult(composeFixture),
    composeResult: composeFixture,
    validationResult: validationFixture,
    recommendationResult: recommendationFixture,
  });

  assert.equal(state.loadState, "success");
  assert.equal(state.selectedItemId, "epic-0001");
  assert.equal(state.composeResult?.composedNodes.length, 3);
  assert.equal(state.validationResult?.summary.total, 1);
  assert.equal(state.recommendationResult?.recommendations.length, 1);
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
    recommendationResult: recommendationFixture,
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
    recommendationResult: recommendationFixture,
  });

  assert.equal(nextState.selectedItemId, "feature-0001");
});

test("restored URL selection is retained when it exists in the loaded workspace", () => {
  const state = workspaceReducer(
    initialWorkspaceState,
    {
      type: "workspaceRestored",
      repoPath: "C:/repo",
      screen: "Detail",
      selectedItemId: "feature-0001",
    },
  );
  const loadedState = workspaceReducer(state, {
    type: "loadSucceeded",
    repoPath: "C:/repo",
    parseResult: toParseResult(composeFixture),
    composeResult: composeFixture,
    validationResult: validationFixture,
    recommendationResult: recommendationFixture,
    selectedItemId: "feature-0001",
  });

  assert.equal(loadedState.activeScreen, "Detail");
  assert.equal(loadedState.selectedItemId, "feature-0001");
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

test("execution slice selector keeps active thematic work ahead of history", () => {
  const baseSlice = {
    sliceId: "SL-0002",
    title: "Historical proof",
    planningStatus: "done" as const,
    resolution: "validated" as const,
    linkedSpecIds: [],
    objective: "Record history.",
    entryCriteria: [],
    scope: { included: [], excluded: [] },
    work: [],
    exitCriteria: [],
    requiredEvidence: [],
    observedEvidence: [],
    killCriteria: [],
    dependencySliceIds: [],
    decisions: [],
    blockers: [],
    nextAction: "",
  };
  const composeResult: ComposeRepositoryResult = {
    ...composeFixture,
    overlayFiles: [{
      ...composeFixture.overlayFiles[0],
      executionSlices: [
        baseSlice,
        {
          ...baseSlice,
          sliceId: "SL-0001",
          title: "Current proof",
          planningStatus: "in_progress",
          resolution: undefined,
        },
      ],
    }],
  };

  assert.deepEqual(
    getExecutionSlices(composeResult).map((entry) => entry.slice.sliceId),
    ["SL-0001", "SL-0002"],
  );
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

test("board filters can isolate blocked items, dependency items, or both", () => {
  const nodes = [
    composeFixture.composedNodes[0],
    {
      ...composeFixture.composedNodes[1],
      overlay: {
        ...composeFixture.composedNodes[1].overlay,
        dependencies: ["story-0001"],
      },
    },
    composeFixture.composedNodes[2],
  ];

  assert.equal(filterBoardNodes(nodes, { blockedOnly: true, hasDependencies: false }).length, 1);
  assert.equal(filterBoardNodes(nodes, { blockedOnly: false, hasDependencies: true }).length, 1);
  assert.equal(filterBoardNodes(nodes, { blockedOnly: true, hasDependencies: true }).length, 0);
  assert.equal(filterBoardNodes(nodes, { blockedOnly: false, hasDependencies: false }).length, 3);
});

test("triage badge selectors expose blocked and dependency states for compact badges", () => {
  const blockedWithDependencies = {
    ...composeFixture.composedNodes[2],
    overlay: {
      ...composeFixture.composedNodes[2].overlay,
      blocked: true,
      blockedReason: "Waiting for contract update",
      dependencies: ["feature-0001", "story-0002"],
    },
  };

  assert.equal(getDependencyCount(blockedWithDependencies), 2);
  assert.deepEqual(getTriageBadges(blockedWithDependencies), [
    {
      kind: "blocked",
      label: "Blocked",
      title: "Waiting for contract update",
    },
    {
      kind: "dependencies",
      label: "Deps: 2",
      title: "2 dependency references",
    },
  ]);

  assert.deepEqual(getTriageBadges(composeFixture.composedNodes[0]), []);
});

test("warnings filters can narrow findings by severity and rule id", () => {
  const findings: ValidationResult["findings"] = [
    {
      ruleId: "V-101",
      severity: "warning",
      message: "Unknown overlay spec ID.",
      sourcePaths: ["specforge/overlay/local.overlay.json"],
      specId: "feature-9999",
    },
    {
      ruleId: "V-400",
      severity: "error",
      message: "Missing required section.",
      sourcePaths: ["specs/epic-0001-foundation/epic.md"],
      specId: "epic-0001",
    },
  ];

  const severityFiltered = filterValidationFindings(findings, {
    severity: { error: true, warning: false, info: false },
    ruleIdQuery: "",
  });
  assert.equal(severityFiltered.length, 1);
  assert.equal(severityFiltered[0]?.ruleId, "V-400");

  const ruleFiltered = filterValidationFindings(findings, {
    severity: { error: true, warning: true, info: true },
    ruleIdQuery: "101",
  });
  assert.equal(ruleFiltered.length, 1);
  assert.equal(ruleFiltered[0]?.ruleId, "V-101");
});

test("warnings empty state distinguishes between missing findings and filter misses", () => {
  assert.equal(getWarningsEmptyState(0, 0), "no-findings");
  assert.equal(getWarningsEmptyState(2, 0), "no-matches");
  assert.equal(getWarningsEmptyState(2, 1), undefined);
});

test("finding selection helper enables spec navigation only for known composed nodes", () => {
  const withoutCompose = getFindingNavigationSpecId({
    ruleId: "V-400",
    severity: "error",
    message: "Missing required section.",
    sourcePaths: ["specs/epic-0001-foundation/epic.md"],
    specId: "epic-0001",
  });
  assert.equal(withoutCompose, undefined);

  const validSpecId = getFindingNavigationSpecId(
    {
      ruleId: "V-400",
      severity: "error",
      message: "Missing required section.",
      sourcePaths: ["specs/epic-0001-foundation/epic.md"],
      specId: "epic-0001",
    },
    composeFixture,
  );
  assert.equal(validSpecId, "epic-0001");

  const unknownSpecId = getFindingNavigationSpecId(
    {
      ruleId: "V-101",
      severity: "warning",
      message: "Unknown overlay spec ID.",
      sourcePaths: ["specforge/overlay/local.overlay.json"],
      specId: "feature-9999",
    },
    composeFixture,
  );
  assert.equal(unknownSpecId, undefined);

  const navigatedState = workspaceReducer(initialWorkspaceState, {
    type: "itemSelected",
    specId: validSpecId,
  });
  assert.equal(navigatedState.selectedItemId, "epic-0001");
});

function boardNode(
  id: string, type: SpecNodeType, parentId?: string, status?: PlanningStatus,
  blocked = false, dependencies: string[] = [],
): ComposedNode {
  return {
    spec: { id, type, parentId, title: `Title ${id}`, summary: '', sourcePath: `${id}.md`, childrenIds: [] },
    ...(status ? { overlay: { specId: id, planningStatus: status, blocked, dependencies,
      sourcePath: 'test.overlay.json', repositoryId: 'board-test' } } : {}),
  };
}

function hierarchyBoardFixture(): ComposeRepositoryResult {
  return {
    ...composeFixture,
    composedNodes: [
      boardNode('E-0002', 'epic', undefined, 'backlog'),
      boardNode('E-0001', 'epic', undefined, 'done'),
      boardNode('F-0002', 'feature', 'E-0002', 'backlog'),
      boardNode('F-0001', 'feature', 'E-0001', 'ready'),
      boardNode('F-0003', 'feature', 'E-missing'),
      boardNode('S-0003', 'story', 'F-0001', 'done', true, ['F-0002']),
      boardNode('S-0001', 'story', 'F-0001', 'backlog', false, ['F-0002']),
      boardNode('S-0002', 'story', 'F-0001', 'blocked', true),
      boardNode('S-0004', 'story', 'F-0003'),
      boardNode('T-0001', 'task', 'S-0001', 'done'),
      boardNode('T-0002', 'task', 'S-0001', 'done', true, ['T-0001']),
      boardNode('T-0003', 'task', 'S-0001', 'done'),
      boardNode('T-0004', 'task', 'S-0001'),
      boardNode('T-0005', 'task', 'S-0001', 'blocked', true),
      boardNode('S-missing', 'story', 'F-missing', 'ready'),
      boardNode('S-wrong', 'story', 'E-0001', 'ready'),
      boardNode('S-cycle', 'story', 'T-cycle', 'ready'),
      boardNode('T-cycle', 'task', 'S-cycle', 'ready'),
      boardNode('T-no-parent', 'task'),
      boardNode('T-wrong', 'task', 'F-0001', 'backlog'),
      boardNode('T-missing', 'task', 'S-absent', 'backlog'),
    ],
  };
}

const allBoardCards = (model: ReturnType<typeof getBoardModel>) =>
  model.groups.flatMap((group) => group.lanes.flatMap((lane) => lane.cards));

test('Board defaults focus on Features and Stories without sharing mutable filter state', () => {
  const filters = createBoardFilters();
  assert.deepEqual(filters, {
    selectedTypes: ['feature', 'story'], blockedOnly: false, hasDependencies: false, showDoneInCompletedFeatures: false,
  });
  assert.notEqual(filters.selectedTypes, createBoardFilters().selectedTypes);
  const fixture = hierarchyBoardFixture();
  const model = getBoardModel(fixture);
  assert.deepEqual(model.groups.map((group) => group.id), ['F-0001', 'F-0002', 'F-0003', 'unresolved']);
  assert.ok(allBoardCards(model).every(({ node }) => ['feature', 'story'].includes(node.spec.type)));
  assert.deepEqual(getBoardModel().groups, []);
});

test('Board keeps cross-status siblings together and preserves hidden Feature context', () => {
  const fixture = hierarchyBoardFixture();
  const model = getBoardModel(fixture);
  const row = model.groups[0];
  assert.deepEqual(row.lanes.map((lane) => [lane.status, lane.cards.map(({ node }) => node.spec.id)]), [
    ['unplanned', []], ['backlog', ['S-0001']], ['ready', ['F-0001']],
    ['in_progress', ['S-0002']], ['done', ['S-0003']],
  ]);
  assert.equal(row.parent?.node?.spec.id, 'E-0001');
  assert.deepEqual(row.progress, { completed: 1, total: 3 });
  const stories = getBoardModel(fixture, { ...createBoardFilters(), selectedTypes: ['story'] });
  assert.deepEqual(stories.groups.map((group) => group.id), ['F-0001', 'F-0003', 'unresolved']);
  assert.equal(stories.groups[0].feature?.spec.id, 'F-0001');
  assert.equal(stories.groups[0].parent?.node?.spec.title, 'Title E-0001');
  assert.deepEqual(model.groups.find((group) => group.id === 'F-0002')?.progress, { completed: 0, total: 0 });
});

test('Board all type and quick-filter combinations produce exact counts and immutable progress', () => {
  const fixture = hierarchyBoardFixture();
  const before = structuredClone(fixture);
  const overviewCounts = getPlanningStatusCounts(fixture);
  for (let mask = 0; mask < 16; mask++) {
    const selectedTypes = BOARD_ITEM_TYPES.filter((_, index) => mask & (1 << index));
    for (const blockedOnly of [false, true]) {
      for (const hasDependencies of [false, true]) {
        const model = getBoardModel(fixture, { selectedTypes, blockedOnly, hasDependencies });
        const expected = fixture.composedNodes.filter((node) => selectedTypes.includes(node.spec.type)
          && (!blockedOnly || node.overlay?.blocked)
          && (!hasDependencies || (node.overlay?.dependencies?.length ?? 0) > 0));
        const cards = allBoardCards(model);
        assert.deepEqual(cards.map(({ node }) => node.spec.id).sort(), expected.map((node) => node.spec.id).sort());
        assert.equal(new Set(cards.map(({ node }) => node.spec.id)).size, cards.length);
        for (const lane of model.lanes) {
          const count = expected.filter((node) => {
            const status = node.overlay?.planningStatus;
            return (status === 'blocked' ? 'in_progress' : status ?? 'unplanned') === lane.status;
          }).length;
          assert.equal(lane.count, count);
        }
        assert.ok(model.groups.every((group) => group.lanes.some((lane) => lane.cards.length)));
        const row = model.groups.find((group) => group.id === 'F-0001');
        if (row) assert.deepEqual(row.progress, { completed: 1, total: 3 });
        const story = cards.find(({ node }) => node.spec.id === 'S-0001');
        if (story) assert.deepEqual(story.progress, { completed: 3, total: 5 });
      }
    }
  }
  assert.deepEqual(getPlanningStatusCounts(fixture), overviewCounts);
  assert.deepEqual(fixture, before);
});

test('Board places optional Epics and Tasks once and retains invalid chains with parent references', () => {
  const model = getBoardModel(hierarchyBoardFixture(), { ...createBoardFilters(), selectedTypes: BOARD_ITEM_TYPES });
  assert.equal(model.groups[0].id, 'epics');
  assert.equal(model.groups.at(-1)?.id, 'unresolved');
  const feature = model.groups.find((group) => group.id === 'F-0001')!;
  const task = feature.lanes.flatMap((lane) => lane.cards).find(({ node }) => node.spec.id === 'T-0001')!;
  assert.equal(task.parent?.node?.spec.id, 'S-0001');
  const unresolved = model.groups.at(-1)!.lanes.flatMap((lane) => lane.cards);
  assert.deepEqual(unresolved.map(({ node }) => node.spec.id).sort(), [
    'S-cycle', 'S-missing', 'S-wrong', 'T-cycle', 'T-missing', 'T-no-parent', 'T-wrong',
  ]);
  assert.equal(unresolved.find(({ node }) => node.spec.id === 'S-missing')?.parent?.id, 'F-missing');
  assert.equal(unresolved.find(({ node }) => node.spec.id === 'S-wrong')?.parent?.node, undefined);
  assert.equal(unresolved.find(({ node }) => node.spec.id === 'T-no-parent')?.parent?.id, undefined);
  assert.equal(unresolved.find(({ node }) => node.spec.id === 'T-cycle')?.parent?.node?.spec.id, 'S-cycle');
  const missingEpic = model.groups.find((group) => group.id === 'F-0003')!;
  assert.equal(missingEpic.parent?.id, 'E-missing');
  assert.equal(missingEpic.parent?.node, undefined);
  assert.ok(missingEpic.lanes.flatMap((lane) => lane.cards).some(({ node }) => node.spec.id === 'S-0004'));
});

test('Board progress refreshes from direct children without rolling up parent status', () => {
  const fixture = hierarchyBoardFixture();
  const story = () => allBoardCards(getBoardModel(fixture)).find(({ node }) => node.spec.id === 'S-0001')!;
  assert.deepEqual(story().progress, { completed: 3, total: 5 });
  fixture.composedNodes.find((node) => node.spec.id === 'T-0005')!.overlay!.planningStatus = 'done';
  assert.deepEqual(story().progress, { completed: 4, total: 5 });
  assert.equal(story().node.overlay?.planningStatus, 'backlog');
  assert.deepEqual(allBoardCards(getBoardModel(fixture)).find(({ node }) => node.spec.id === 'S-0004')!.progress,
    { completed: 0, total: 0 });
  const reversed = { ...fixture, composedNodes: [...fixture.composedNodes].reverse() };
  assert.deepEqual(getBoardModel(reversed), getBoardModel(fixture));
});

function completedFeatureBoardFixture(): ComposeRepositoryResult {
  const fixture = hierarchyBoardFixture();
  fixture.composedNodes.push(
    boardNode('F-done', 'feature', 'E-0001', 'done', true, ['F-0001']),
    boardNode('S-done-child', 'story', 'F-done', 'done', true, ['S-0001']),
    boardNode('S-open-child', 'story', 'F-done', 'in_progress', true, ['S-0001']),
    boardNode('T-open-under-done', 'task', 'S-done-child', 'ready', true, ['T-0001']),
    boardNode('T-done-child', 'task', 'S-done-child', 'done', true, ['T-0001']),
    boardNode('T-done-under-open', 'task', 'S-open-child', 'done', true, ['T-0001']),
    boardNode('T-unplanned-child', 'task', 'S-open-child'),
    boardNode('F-complete', 'feature', 'E-0001', 'done'),
    boardNode('S-complete', 'story', 'F-complete', 'done'),
    boardNode('T-complete', 'task', 'S-complete', 'done'),
  );
  // These done items have no valid Feature membership and must remain eligible.
  for (const node of fixture.composedNodes) {
    if (['S-missing', 'S-wrong', 'S-cycle', 'T-cycle', 'T-wrong', 'T-missing'].includes(node.spec.id)) {
      node.overlay!.planningStatus = 'done';
    }
  }
  return fixture;
}

const hiddenCompletedFeatureIds = new Set([
  'F-done', 'S-done-child', 'T-done-child', 'T-done-under-open', 'F-complete', 'S-complete', 'T-complete',
]);

test('Board hides done cards only in done Features, retaining open children and complete row context', () => {
  const fixture = completedFeatureBoardFixture();
  const filters = { blockedOnly: false, hasDependencies: false, selectedTypes: BOARD_ITEM_TYPES };
  const model = getBoardModel(fixture, filters); // Omitted flag must use the false default.
  const cards = allBoardCards(model);
  assert.deepEqual(cards.map(({ node }) => node.spec.id).sort(), fixture.composedNodes
    .filter((node) => !hiddenCompletedFeatureIds.has(node.spec.id)).map((node) => node.spec.id).sort());
  const row = model.groups.find((group) => group.id === 'F-done')!;
  assert.equal(row.feature?.spec.id, 'F-done');
  assert.equal(row.parent?.node?.spec.id, 'E-0001');
  assert.deepEqual(row.progress, { completed: 1, total: 2 });
  assert.deepEqual(allBoardCards({ ...model, groups: [row] }).map(({ node }) => node.spec.id).sort(),
    ['S-open-child', 'T-open-under-done', 'T-unplanned-child']);
  assert.deepEqual(cards.find(({ node }) => node.spec.id === 'S-open-child')?.progress, { completed: 1, total: 2 });
  assert.ok(!model.groups.some((group) => group.id === 'F-complete'));
  assert.ok(cards.some(({ node }) => node.spec.id === 'S-0003')); // Done child of ongoing Feature.
  assert.ok(cards.some(({ node }) => node.spec.id === 'E-0001')); // Done Epic.
  const expanded = getBoardModel(fixture, { ...filters, showDoneInCompletedFeatures: true });
  assert.equal(allBoardCards(expanded).length, fixture.composedNodes.length);
  assert.ok(expanded.groups.some((group) => group.id === 'F-complete'));
});

test('Board completed-Feature checkbox composes with all 64 type and quick-filter selections', () => {
  const fixture = completedFeatureBoardFixture();
  const before = structuredClone(fixture);
  const overviewCounts = getPlanningStatusCounts(fixture);
  const full = getBoardModel(fixture, {
    ...createBoardFilters(), selectedTypes: BOARD_ITEM_TYPES, showDoneInCompletedFeatures: true,
  });
  const rowProgress = new Map(full.groups.map((group) => [group.id, group.progress]));
  const cardProgress = new Map(allBoardCards(full).map((card) => [card.node.spec.id, card.progress]));
  for (const showDoneInCompletedFeatures of [false, true]) {
    for (let mask = 0; mask < 16; mask++) {
      const selectedTypes = BOARD_ITEM_TYPES.filter((_, index) => mask & (1 << index));
      for (const blockedOnly of [false, true]) {
        for (const hasDependencies of [false, true]) {
          const model = getBoardModel(fixture, { selectedTypes, blockedOnly, hasDependencies, showDoneInCompletedFeatures });
          const expected = fixture.composedNodes.filter((node) => selectedTypes.includes(node.spec.type)
            && (!blockedOnly || node.overlay?.blocked)
            && (!hasDependencies || (node.overlay?.dependencies?.length ?? 0) > 0)
            && (showDoneInCompletedFeatures || !hiddenCompletedFeatureIds.has(node.spec.id)));
          const cards = allBoardCards(model);
          assert.deepEqual(cards.map(({ node }) => node.spec.id).sort(), expected.map((node) => node.spec.id).sort());
          assert.equal(new Set(cards.map(({ node }) => node.spec.id)).size, cards.length);
          for (const lane of model.lanes) {
            assert.equal(lane.count, expected.filter((node) => {
              const status = node.overlay?.planningStatus;
              return (status === 'blocked' ? 'in_progress' : status ?? 'unplanned') === lane.status;
            }).length);
          }
          assert.equal(model.lanes.at(-1)?.status, 'done');
          for (const group of model.groups) {
            assert.ok(group.lanes.some((lane) => lane.cards.length));
            assert.deepEqual(group.progress, rowProgress.get(group.id));
          }
          for (const card of cards) assert.deepEqual(card.progress, cardProgress.get(card.node.spec.id));
        }
      }
    }
  }
  assert.deepEqual(getPlanningStatusCounts(fixture), overviewCounts);
  assert.deepEqual(fixture, before);
});

test('Board completed filtering uses only explicit done Feature status and refreshes from the full model', () => {
  const fixture = completedFeatureBoardFixture();
  const filters = { ...createBoardFilters(), selectedTypes: BOARD_ITEM_TYPES };
  const feature = fixture.composedNodes.find((node) => node.spec.id === 'F-done')!;
  for (const status of ['backlog', 'ready', 'in_progress', 'blocked', undefined] as const) {
    feature.overlay!.planningStatus = status;
    const ids = allBoardCards(getBoardModel(fixture, filters)).map(({ node }) => node.spec.id);
    for (const id of ['F-done', 'S-done-child', 'T-done-child', 'T-done-under-open']) assert.ok(ids.includes(id));
  }
  delete feature.overlay;
  assert.ok(allBoardCards(getBoardModel(fixture, filters)).some(({ node }) => node.spec.id === 'S-done-child'));
  feature.overlay = { specId: 'F-done', planningStatus: 'done', blocked: false, sourcePath: 'test.json', repositoryId: 'test' };
  assert.ok(!allBoardCards(getBoardModel(fixture, filters)).some(({ node }) => node.spec.id === 'S-done-child'));
  assert.equal(filters.showDoneInCompletedFeatures, false);
});

test('Board keeps Done column with zero visible items when every Feature card is done', () => {
  const fixture = completedFeatureBoardFixture();
  fixture.composedNodes = fixture.composedNodes.filter((node) => ['F-complete', 'S-complete', 'T-complete'].includes(node.spec.id));
  const model = getBoardModel(fixture, { ...createBoardFilters(), selectedTypes: BOARD_ITEM_TYPES });
  assert.deepEqual(model.groups, []);
  assert.equal(model.lanes.length, 5);
  assert.deepEqual(model.lanes.at(-1), { status: 'done', count: 0 });
  assert.equal(allBoardCards(getBoardModel(fixture, {
    ...createBoardFilters(), selectedTypes: BOARD_ITEM_TYPES, showDoneInCompletedFeatures: true,
  })).length, 3);
});
