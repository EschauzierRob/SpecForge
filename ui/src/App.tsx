import { FormEvent, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { Board } from "./Board";
import { Detail } from "./Detail";
import { Slices } from "./Slices";
import { WarningsPanel } from "./WarningsPanel";
import { fetchCompose, fetchContext, fetchRecommend, fetchValidate } from "./lib/api";
import type {
  ComposeRepositoryResult,
  DiagnosticSeverity,
  RecommendationResult,
  UiScreen,
  UiWorkspaceState,
  ValidationResult,
} from "./lib/contracts";
import {
  getOverviewCounts,
  getComposedTreeModel,
  createWarningsFilters,
  getPlanningStatusCounts,
  getTriageBadges,
  getSelectedComposedNode,
  getSelectedLineageToEpic,
  PLANNING_STATUS_LANE_ORDER,
  type WarningsFilters,
} from "./lib/selectors";
import {
  initialWorkspaceState,
  toParseResult,
  workspaceReducer,
} from "./lib/workspace-state";
import {
  createWorkspaceUrl,
  readWorkspaceUrlState,
  type WorkspaceUrlState,
} from "./lib/workspace-url-state";
import { getWorkspaceDocumentTitle } from "./lib/workspace-title";

const THEME_STORAGE_KEY = "specforge.theme";
type Theme = "light" | "dark";

const screens: UiScreen[] = ["Overview", "Tree", "Board", "Slices", "Detail", "Warnings", "Next Work"];

function MetricCard(props: { label: string; value: number | string }): JSX.Element {
  return (
    <div className="metric-card">
      <span className="metric-label">{props.label}</span>
      <strong className="metric-value">{props.value}</strong>
    </div>
  );
}

function SeverityCard(props: { label: string; counts: Record<DiagnosticSeverity, number> }): JSX.Element {
  return (
    <div className="metric-card metric-card--detail">
      <span className="metric-label">{props.label}</span>
      <strong className="metric-value metric-value--small">
        {props.counts.error} error / {props.counts.warning} warning / {props.counts.info} info
      </strong>
    </div>
  );
}

function PlaceholderPanel(props: { title: string; detail: string }): JSX.Element {
  return (
    <section className="panel placeholder-panel">
      <h2>{props.title}</h2>
      <p>{props.detail}</p>
    </section>
  );
}

function TreePanel(props: {
  composeResult?: ComposeRepositoryResult;
  selectedItemId?: string;
  onSelect(specId: string): void;
}): JSX.Element {
  const tree = useMemo(() => getComposedTreeModel(props.composeResult), [props.composeResult]);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const nextExpandedIds: Record<string, boolean> = {};
    for (const nodeId of Object.keys(tree.byId)) {
      if (tree.byId[nodeId].children.length > 0) {
        nextExpandedIds[nodeId] = true;
      }
    }
    setExpandedIds(nextExpandedIds);
  }, [tree]);

  if (tree.roots.length === 0) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Canonical hierarchy</h2>
            <p>Load a workspace to inspect parent-child relationships and planning overlays.</p>
          </div>
        </div>
        <div className="quick-pick-empty">No hierarchy data loaded yet.</div>
      </section>
    );
  }

  const toggleNode = (nodeId: string): void => {
    setExpandedIds((current) => ({ ...current, [nodeId]: !current[nodeId] }));
  };

  function renderNode(nodeId: string): JSX.Element {
    const entry = tree.byId[nodeId];
    const { node, children, depth } = entry;
    const isExpanded = expandedIds[nodeId] ?? true;
    const planningStatus = node.overlay?.planningStatus;
    const triageBadges = getTriageBadges(node);

    return (
      <li key={nodeId}>
        <div
          className={node.spec.id === props.selectedItemId ? "tree-row tree-row--active" : "tree-row"}
          style={{ paddingLeft: `${12 + depth * 18}px` }}
        >
          {children.length > 0 ? (
            <button
              type="button"
              className="tree-toggle"
              onClick={() => toggleNode(nodeId)}
              aria-label={isExpanded ? `Collapse ${node.spec.id}` : `Expand ${node.spec.id}`}
            >
              {isExpanded ? "▾" : "▸"}
            </button>
          ) : (
            <span className="tree-toggle tree-toggle--placeholder">•</span>
          )}

          <button type="button" className="tree-item" onClick={() => props.onSelect(node.spec.id)}>
            <span className="tree-item-id">{node.spec.id}</span>
            <strong>{node.spec.title}</strong>
            <span className="tree-item-type">{node.spec.type}</span>
          </button>

          <div className="tree-badges">
            {planningStatus ? <span className="tree-badge">{planningStatus}</span> : null}
            {triageBadges.map((badge) => (
              <span
                key={badge.kind}
                className={badge.kind === "blocked" ? "tree-badge tree-badge--blocked" : "tree-badge tree-badge--dependencies"}
                title={badge.title}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        {children.length > 0 && isExpanded ? <ul className="tree-list">{children.map(renderNode)}</ul> : null}
      </li>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Canonical hierarchy</h2>
          <p>Tree order is derived from canonical parent/child relationships with overlay status badges.</p>
        </div>
      </div>
      <ul className="tree-list">{tree.roots.map(renderNode)}</ul>
    </section>
  );
}

function QuickPickList(props: {
  composeResult?: ComposeRepositoryResult;
  selectedItemId?: string;
  onSelect(specId: string): void;
}): JSX.Element {
  const items = props.composeResult?.composedNodes.slice(0, 8) ?? [];

  if (items.length === 0) {
    return (
      <div className="quick-pick-empty">
        Load a workspace to start selecting spec items for later detail views.
      </div>
    );
  }

  return (
    <div className="quick-pick-list">
      {items.map((node) => (
        <button
          key={node.spec.id}
          type="button"
          className={node.spec.id === props.selectedItemId ? "quick-pick quick-pick--active" : "quick-pick"}
          onClick={() => props.onSelect(node.spec.id)}
        >
          <span className="quick-pick-id">{node.spec.id}</span>
          <strong>{node.spec.title}</strong>
        </button>
      ))}
    </div>
  );
}

function OverviewPanel(props: {
  composeResult?: ComposeRepositoryResult;
  validationResult?: ValidationResult;
  selectedTitle: string;
  selectedSummary: string;
  selectedItemId?: string;
  onSelect(specId: string): void;
}): JSX.Element {
  const counts = getOverviewCounts(props.composeResult, props.validationResult);
  const planningStatusCounts = getPlanningStatusCounts(props.composeResult);
  const blockedCount = props.composeResult?.composedNodes.filter((node) => node.overlay?.blocked).length ?? 0;

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Workspace overview</h2>
          <p>Status lanes track planning progress, while the blocked flag is a separate urgency signal.</p>
        </div>
        <div className="panel-pill">Selected: {props.selectedTitle}</div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Spec nodes" value={counts.specCount} />
        <MetricCard label="Overlay files" value={counts.overlayFileCount} />
        <MetricCard label="Composed nodes" value={counts.composedNodeCount} />
        <MetricCard label="Validation findings" value={counts.validationFindings.total} />
      </div>

      <div className="detail-grid">
        <SeverityCard label="Parser diagnostics" counts={counts.parserDiagnostics} />
        <SeverityCard label="Composition diagnostics" counts={counts.compositionDiagnostics} />
        <SeverityCard
          label="Validation findings"
          counts={{
            error: counts.validationFindings.error,
            warning: counts.validationFindings.warning,
            info: counts.validationFindings.info,
          }}
        />
      </div>

      <div className="status-strip">
        {PLANNING_STATUS_LANE_ORDER.map((status) => (
          <div className="status-pill" key={status}>
            <span>{status}</span>
            <strong>{planningStatusCounts[status]}</strong>
          </div>
        ))}
        <div className="status-pill">
          <span>blocked flag</span>
          <strong>{blockedCount}</strong>
        </div>
      </div>

      <div className="split-panel">
        <div>
          <h3>Quick selection</h3>
          <QuickPickList
            composeResult={props.composeResult}
            selectedItemId={props.selectedItemId}
            onSelect={props.onSelect}
          />
        </div>
        <div>
          <h3>Selection preview</h3>
          <p>{props.selectedSummary}</p>
        </div>
      </div>
    </section>
  );
}

function DebugPanel(props: {
  selectedNodeJson: string;
  composeJson: string;
  validationJson: string;
}): JSX.Element {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Debug inspector</h2>
          <p>Raw payloads stay visible here so future tree, board, detail, and warning views can be checked quickly.</p>
        </div>
      </div>

      <details open className="debug-block">
        <summary>Selected item</summary>
        <pre>{props.selectedNodeJson}</pre>
      </details>

      <details className="debug-block">
        <summary>Compose payload</summary>
        <pre>{props.composeJson}</pre>
      </details>

      <details className="debug-block">
        <summary>Validation payload</summary>
        <pre>{props.validationJson}</pre>
      </details>
    </section>
  );
}

function NextWorkPanel(props: {
  recommendationResult?: RecommendationResult;
  onSelect(specId: string): void;
}): JSX.Element {
  const recommendedItems = props.recommendationResult?.recommendations.slice(0, 12) ?? [];

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Recommended next work</h2>
          <p>Story-sized work is recommended first, with epic and feature priority inherited as context.</p>
        </div>
        <div className="panel-pill">{recommendedItems.length} actionable</div>
      </div>

      {recommendedItems.length === 0 ? <div className="quick-pick-empty">No actionable work found for this workspace.</div> : null}

      <div className="warnings-list">
        {recommendedItems.map((item) => (
          <article key={item.specId} className="warnings-item">
            <header className="warnings-item-header">
              <strong>{item.specId} - {item.specTitle}</strong>
              <span className="tree-badge">{item.specType}</span>
              <span className="tree-badge">{item.planningStatus}</span>
              <span className="tree-badge">rank {item.rankValue === Number.MAX_SAFE_INTEGER ? "default" : item.rankValue}</span>
              <button type="button" className="warnings-link" onClick={() => props.onSelect(item.specId)}>
                Open detail
              </button>
            </header>
            <p className="warnings-message">{item.rationale.summary}</p>
            {item.priorityPath.length > 1 ? (
              <p className="warnings-source-paths">Priority path: {item.priorityPath.join(" > ")}</p>
            ) : null}
            <p className="warnings-source-paths">Top factors: {item.rationale.topScoreFactors.join(", ") || "none"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SelectionContextHeader(props: {
  lineage: ComposeRepositoryResult["composedNodes"];
  onSelect(specId: string): void;
}): JSX.Element | null {
  if (props.lineage.length === 0) {
    return null;
  }

  const selectedNode = props.lineage[props.lineage.length - 1];

  return (
    <section className="panel context-header-panel" aria-label="Selection context">
      <div className="context-header-content">
        <span className="context-label">Selection context</span>
        <nav aria-label="Selected node lineage" className="context-breadcrumbs">
          {props.lineage.map((node, index) => {
            const isLast = index === props.lineage.length - 1;
            return (
              <span key={node.spec.id} className="context-crumb">
                {isLast ? (
                  <span className="context-current">{node.spec.title}</span>
                ) : (
                  <button type="button" className="context-link" onClick={() => props.onSelect(node.spec.id)}>
                    {node.spec.title}
                  </button>
                )}
                {!isLast ? <span className="context-separator"> &gt; </span> : null}
              </span>
            );
          })}
        </nav>
      </div>
      <div className="panel-pill">
        {selectedNode.spec.id} · {selectedNode.spec.type}
      </div>
    </section>
  );
}

export default function App(): JSX.Element {
  const [state, dispatch] = useReducer(workspaceReducer, initialWorkspaceState, () => {
    if (typeof window === "undefined") {
      return initialWorkspaceState;
    }

    const urlState = readWorkspaceUrlState(window.location.href);
    return {
      ...initialWorkspaceState,
      repoPath: urlState.repoPath ?? "",
      activeScreen: urlState.activeScreen,
      selectedItemId: urlState.selectedItemId,
    } satisfies UiWorkspaceState;
  });
  const [isBoardDetailOpen, setIsBoardDetailOpen] = useState(false);
  const [warningsFilters, setWarningsFilters] = useState<WarningsFilters>(() => createWarningsFilters());
  const stateRef = useRef(state);
  const workspaceUrlStateRef = useRef<WorkspaceUrlState>({
    repoPath: state.repoPath || undefined,
    activeScreen: state.activeScreen,
    selectedItemId: state.selectedItemId,
  });
  const loadVersionRef = useRef(0);
  const initialUrlLoadStartedRef = useRef(false);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  function writeWorkspaceHistory(urlState: WorkspaceUrlState, mode: "push" | "replace"): void {
    const nextUrl = createWorkspaceUrl(window.location.href, urlState);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextUrl === currentUrl) {
      return;
    }

    if (mode === "push") {
      window.history.pushState(null, "", nextUrl);
      return;
    }

    window.history.replaceState(null, "", nextUrl);
  }

  async function loadWorkspace(repoPath: string, historyMode: "push" | "replace" | "none"): Promise<void> {
    const requestedState: WorkspaceUrlState = {
      ...workspaceUrlStateRef.current,
      repoPath,
    };
    workspaceUrlStateRef.current = requestedState;

    const loadVersion = loadVersionRef.current + 1;
    loadVersionRef.current = loadVersion;
    dispatch({ type: "loadStarted" });

    try {
      const [composeResult, validationResult, recommendationResult] = await Promise.all([
        fetchCompose(repoPath),
        fetchValidate(repoPath),
        fetchRecommend(repoPath),
      ]);

      if (loadVersion !== loadVersionRef.current || workspaceUrlStateRef.current.repoPath !== repoPath) {
        return;
      }

      const requestedItemId = workspaceUrlStateRef.current.selectedItemId;
      const selectedItemId = composeResult.composedNodes.some((node) => node.spec.id === requestedItemId)
        ? requestedItemId
        : composeResult.composedNodes[0]?.spec.id;
      const resolvedUrlState: WorkspaceUrlState = {
        ...workspaceUrlStateRef.current,
        repoPath,
        selectedItemId,
      };
      workspaceUrlStateRef.current = resolvedUrlState;

      dispatch({
        type: "loadSucceeded",
        repoPath,
        parseResult: toParseResult(composeResult),
        composeResult,
        validationResult,
        recommendationResult,
        selectedItemId,
      });

      if (historyMode === "push" || historyMode === "replace") {
        writeWorkspaceHistory(resolvedUrlState, historyMode);
      } else {
        const canonicalUrl = createWorkspaceUrl(window.location.href, resolvedUrlState);
        const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        if (canonicalUrl !== currentUrl) {
          writeWorkspaceHistory(resolvedUrlState, "replace");
        }
      }
    } catch (error) {
      if (loadVersion !== loadVersionRef.current) {
        return;
      }

      const message = error instanceof Error ? error.message : String(error);
      dispatch({ type: "loadFailed", message });
    }
  }

  useEffect(() => {
    let cancelled = false;

    fetchContext().then(
      (context) => {
        if (!cancelled) {
          dispatch({ type: "contextLoaded", repoPath: context.defaultRepoPath });
        }
      },
      () => {
        // Keep the form usable even if the context bootstrap request fails.
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (initialUrlLoadStartedRef.current || typeof window === "undefined") {
      return;
    }

    initialUrlLoadStartedRef.current = true;
    const urlState = readWorkspaceUrlState(window.location.href);
    workspaceUrlStateRef.current = urlState;

    if (urlState.repoPath) {
      void loadWorkspace(urlState.repoPath, "replace");
    }
  }, []);

  useEffect(() => {
    function restoreWorkspaceFromHistory(): void {
      const urlState = readWorkspaceUrlState(window.location.href);
      workspaceUrlStateRef.current = urlState;
      dispatch({
        type: "workspaceRestored",
        repoPath: urlState.repoPath,
        screen: urlState.activeScreen,
        selectedItemId: urlState.selectedItemId,
      });

      const currentState = stateRef.current;
      const hasRequestedWorkspaceLoaded =
        Boolean(urlState.repoPath) &&
        currentState.loadState === "success" &&
        currentState.repoPath === urlState.repoPath &&
        Boolean(currentState.composeResult);

      if (hasRequestedWorkspaceLoaded && currentState.composeResult) {
        const selectedItemId = currentState.composeResult.composedNodes.some(
          (node) => node.spec.id === urlState.selectedItemId,
        )
          ? urlState.selectedItemId
          : currentState.composeResult.composedNodes[0]?.spec.id;
        const resolvedUrlState = { ...urlState, selectedItemId };

        if (selectedItemId !== urlState.selectedItemId) {
          workspaceUrlStateRef.current = resolvedUrlState;
          dispatch({ type: "itemSelected", specId: selectedItemId });
          writeWorkspaceHistory(resolvedUrlState, "replace");
        }
      }

      if (urlState.repoPath && !hasRequestedWorkspaceLoaded) {
        void loadWorkspace(urlState.repoPath, "none");
      }

      if (!urlState.repoPath) {
        loadVersionRef.current += 1;
      }
    }

    window.addEventListener("popstate", restoreWorkspaceFromHistory);
    return () => window.removeEventListener("popstate", restoreWorkspaceFromHistory);
  }, []);

  async function handleLoad(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await loadWorkspace(state.repoPath, "push");
  }

  const selectedNode = getSelectedComposedNode(state.composeResult, state.selectedItemId);
  const selectedLineage = getSelectedLineageToEpic(state.composeResult, state.selectedItemId);
  const selectedTitle = selectedNode?.spec.title ?? "No item selected";
  const selectedSummary = selectedNode?.spec.summary ?? "Select a node to keep later detail views grounded in real runtime data.";

  useEffect(() => {
    document.title = getWorkspaceDocumentTitle(
      state.loadState === "success" ? state.composeResult?.discovery.repoRoot : undefined,
    );
  }, [state.composeResult?.discovery.repoRoot, state.loadState]);

  useEffect(() => {
    if (state.activeScreen !== "Board") {
      setIsBoardDetailOpen(false);
    }
  }, [state.activeScreen]);

  function handleItemSelected(specId: string, switchToDetail = false): void {
    const nextUrlState: WorkspaceUrlState = {
      ...workspaceUrlStateRef.current,
      activeScreen: switchToDetail ? "Detail" : stateRef.current.activeScreen,
      selectedItemId: specId,
    };
    workspaceUrlStateRef.current = nextUrlState;
    dispatch({ type: "itemSelected", specId });
    if (switchToDetail) {
      dispatch({ type: "screenChanged", screen: "Detail" });
    }
    writeWorkspaceHistory(nextUrlState, "push");
  }

  function handleScreenChanged(screen: UiScreen): void {
    const nextUrlState: WorkspaceUrlState = {
      ...workspaceUrlStateRef.current,
      activeScreen: screen,
    };
    workspaceUrlStateRef.current = nextUrlState;
    dispatch({ type: "screenChanged", screen });
    writeWorkspaceHistory(nextUrlState, "push");
  }

  const activePanel = (() => {
    if (state.activeScreen === "Overview") {
      return (
        <div className="stack">
          <SelectionContextHeader lineage={selectedLineage} onSelect={(specId) => handleItemSelected(specId)} />
          <OverviewPanel
            composeResult={state.composeResult}
            validationResult={state.validationResult}
            selectedTitle={selectedTitle}
            selectedSummary={selectedSummary}
            selectedItemId={state.selectedItemId}
            onSelect={(specId) => handleItemSelected(specId)}
          />
          <DebugPanel
            selectedNodeJson={JSON.stringify(selectedNode ?? null, null, 2)}
            composeJson={JSON.stringify(state.composeResult ?? null, null, 2)}
            validationJson={JSON.stringify(state.validationResult ?? null, null, 2)}
          />
        </div>
      );
    }

    if (state.activeScreen === "Tree") {
      return (
        <div className="stack">
          <SelectionContextHeader lineage={selectedLineage} onSelect={(specId) => handleItemSelected(specId)} />
          <TreePanel
            composeResult={state.composeResult}
            selectedItemId={state.selectedItemId}
            onSelect={(specId) => handleItemSelected(specId)}
          />
        </div>
      );
    }

    if (state.activeScreen === "Board") {
      return (
        <>
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Planning board</h2>
                <p>Lanes show planning status only; blocked remains a card-level urgency flag in every lane.</p>
              </div>
            </div>
            <Board
              composeResult={state.composeResult}
              selectedItemId={state.selectedItemId}
              onSelect={(specId) => {
                handleItemSelected(specId);
                setIsBoardDetailOpen(true);
              }}
            />
          </section>

          {isBoardDetailOpen ? (
            <aside className="board-detail-drawer board-detail-drawer--open" aria-label="Selected card detail">
              <div className="board-detail-drawer__header">
                <strong>Card detail</strong>
                <button type="button" className="board-detail-drawer__close" onClick={() => setIsBoardDetailOpen(false)}>
                  Close
                </button>
              </div>
              <Detail
                composeResult={state.composeResult}
                selectedItemId={state.selectedItemId}
                onNavigate={(specId) => {
                  handleItemSelected(specId);
                  setIsBoardDetailOpen(true);
                }}
              />
            </aside>
          ) : null}
        </>
      );
    }

    if (state.activeScreen === "Detail") {
      return (
        <div className="stack">
          <SelectionContextHeader lineage={selectedLineage} onSelect={(specId) => handleItemSelected(specId)} />
          <Detail
            composeResult={state.composeResult}
            selectedItemId={state.selectedItemId}
            onNavigate={(specId) => handleItemSelected(specId, true)}
          />
        </div>
      );
    }

    if (state.activeScreen === "Slices") {
      return (
        <Slices
          composeResult={state.composeResult}
          onOpenSpec={(specId) => handleItemSelected(specId, true)}
        />
      );
    }

    if (state.activeScreen === "Warnings") {
      return (
        <WarningsPanel
          validationResult={state.validationResult}
          composeResult={state.composeResult}
          filters={warningsFilters}
          onFiltersChanged={setWarningsFilters}
          onFindingSelected={(specId) => handleItemSelected(specId, true)}
        />
      );
    }

    return (
      <NextWorkPanel
        recommendationResult={state.recommendationResult}
        onSelect={(specId) => handleItemSelected(specId, true)}
      />
    );
  })();

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-top-row">
          <img
            className="hero-logo"
            src="/specforge-header.png"
            alt="SpecForge"
            width="1220"
            height="350"
          />
          <button
            type="button"
            className="theme-toggle"
            aria-pressed={theme === "dark"}
            onClick={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}
          </button>
        </div>
        <div>
          <h1>Inspect your local spec repository in a stable, read-only workspace.</h1>
          <p className="hero-copy">
            Slice 5 wires the existing TypeScript pipeline into a lightweight browser shell so later feature slices can focus on views instead of plumbing.
          </p>
        </div>
      </header>

      <main className={state.activeScreen === "Board" ? "workspace workspace--board" : "workspace"}>
        <section className="panel toolbar-panel">
          <div className="toolbar-row">
            <nav className="screen-nav" aria-label="Workspace screens">
              {screens.map((screen) => (
                <button
                  type="button"
                  key={screen}
                  className={screen === state.activeScreen ? "screen-tab screen-tab--active" : "screen-tab"}
                  onClick={() => handleScreenChanged(screen)}
                >
                  {screen}
                </button>
              ))}
            </nav>

            <form className="toolbar" onSubmit={handleLoad}>
              <label className="field toolbar-field">
                <span>Repository path</span>
                <input
                  name="repoPath"
                  value={state.repoPath}
                  onChange={(event) => dispatch({ type: "repoPathChanged", repoPath: event.target.value })}
                  placeholder="C:\\path\\to\\repository"
                />
              </label>
              <button type="submit" disabled={state.loadState === "loading" || state.repoPath.trim().length === 0}>
                {state.loadState === "loading" ? "Loading..." : "Load workspace"}
              </button>
            </form>
          </div>

          {state.errorMessage ? <p className="error-banner">{state.errorMessage}</p> : null}
        </section>

        {activePanel}
      </main>
    </div>
  );
}
