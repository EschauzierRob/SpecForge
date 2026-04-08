import { FormEvent, useEffect, useMemo, useReducer, useState } from "react";

import { fetchCompose, fetchContext, fetchValidate } from "./lib/api";
import type {
  ComposeRepositoryResult,
  DiagnosticSeverity,
  UiScreen,
  ValidationResult,
} from "./lib/contracts";
import {
  getOverviewCounts,
  getComposedTreeModel,
  getPlanningStatusCounts,
  getSelectedComposedNode,
} from "./lib/selectors";
import {
  initialWorkspaceState,
  toParseResult,
  workspaceReducer,
} from "./lib/workspace-state";

const screens: UiScreen[] = ["Overview", "Tree", "Board", "Detail", "Warnings", "Next Work"];

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
    const isBlocked = node.overlay?.blocked;

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
            {isBlocked ? <span className="tree-badge tree-badge--blocked">blocked</span> : null}
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

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Workspace overview</h2>
          <p>Read-only counts from the compose and validate pipeline, ready for the next UI slices.</p>
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
        {Object.entries(planningStatusCounts).map(([status, value]) => (
          <div className="status-pill" key={status}>
            <span>{status}</span>
            <strong>{value}</strong>
          </div>
        ))}
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

export default function App(): JSX.Element {
  const [state, dispatch] = useReducer(workspaceReducer, initialWorkspaceState);

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

  async function handleLoad(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    dispatch({ type: "loadStarted" });

    try {
      const composeResult = await fetchCompose(state.repoPath);
      const validationResult = await fetchValidate(state.repoPath);

      dispatch({
        type: "loadSucceeded",
        repoPath: state.repoPath,
        parseResult: toParseResult(composeResult),
        composeResult,
        validationResult,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      dispatch({ type: "loadFailed", message });
    }
  }

  const selectedNode = getSelectedComposedNode(state.composeResult, state.selectedItemId);
  const selectedTitle = selectedNode?.spec.title ?? "No item selected";
  const selectedSummary = selectedNode?.spec.summary ?? "Select a node to keep later detail views grounded in real runtime data.";

  const activePanel = (() => {
    if (state.activeScreen === "Overview") {
      return (
        <div className="stack">
          <OverviewPanel
            composeResult={state.composeResult}
            validationResult={state.validationResult}
            selectedTitle={selectedTitle}
            selectedSummary={selectedSummary}
            selectedItemId={state.selectedItemId}
            onSelect={(specId) => dispatch({ type: "itemSelected", specId })}
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
        <TreePanel
          composeResult={state.composeResult}
          selectedItemId={state.selectedItemId}
          onSelect={(specId) => dispatch({ type: "itemSelected", specId })}
        />
      );
    }

    if (state.activeScreen === "Board") {
      return (
        <PlaceholderPanel
          title="Board foundation"
          detail="Planning status data is already loaded, so the grouped board view can plug into this state next."
        />
      );
    }

    if (state.activeScreen === "Detail") {
      return (
        <PlaceholderPanel
          title="Detail foundation"
          detail={`Current selection: ${selectedTitle}. The detailed item panel will attach here in the next slice.`}
        />
      );
    }

    if (state.activeScreen === "Warnings") {
      return (
        <PlaceholderPanel
          title="Warnings foundation"
          detail="Validation findings are loaded and preserved in state, ready for a filterable warnings panel."
        />
      );
    }

    return (
      <PlaceholderPanel
        title="Next Work foundation"
        detail="The recommendation engine arrives later. This shell keeps the route and payload wiring stable in the meantime."
      />
    );
  })();

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">SpecForge UI foundation</p>
          <h1>Inspect your local spec repository in a stable, read-only workspace.</h1>
          <p className="hero-copy">
            Slice 5 wires the existing TypeScript pipeline into a lightweight browser shell so later feature slices can focus on views instead of plumbing.
          </p>
        </div>
      </header>

      <main className="workspace">
        <section className="panel toolbar-panel">
          <form className="toolbar" onSubmit={handleLoad}>
            <label className="field">
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

          <nav className="screen-nav" aria-label="Workspace screens">
            {screens.map((screen) => (
              <button
                type="button"
                key={screen}
                className={screen === state.activeScreen ? "screen-tab screen-tab--active" : "screen-tab"}
                onClick={() => dispatch({ type: "screenChanged", screen })}
              >
                {screen}
              </button>
            ))}
          </nav>

          <div className="status-bar">
            <span>Load state: {state.loadState}</span>
            <span>Loaded repo: {state.composeResult?.discovery.repoRoot ?? "none yet"}</span>
          </div>

          {state.errorMessage ? <p className="error-banner">{state.errorMessage}</p> : null}
        </section>

        {activePanel}
      </main>
    </div>
  );
}
