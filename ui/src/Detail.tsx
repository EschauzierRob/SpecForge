import { useMemo } from "react";

import type { ComposeRepositoryResult, ComposedNode } from "./lib/contracts";
import { getTriageBadges } from "./lib/selectors";

function FieldList(props: { title: string; items: string[] }): JSX.Element {
  return (
    <section className="detail-section">
      <h3>{props.title}</h3>
      {props.items.length > 0 ? (
        <ul>
          {props.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="detail-empty">not set</p>
      )}
    </section>
  );
}

function OverlayField(props: { label: string; value?: string | number | boolean | string[] }): JSX.Element {
  let displayValue = "not set";

  if (Array.isArray(props.value)) {
    displayValue = props.value.length > 0 ? props.value.join(", ") : "not set";
  } else if (props.value !== undefined) {
    displayValue = String(props.value);
  }

  return (
    <div className="detail-overlay-row">
      <dt>{props.label}</dt>
      <dd>{displayValue}</dd>
    </div>
  );
}

function LinkGroup(props: {
  title: string;
  specIds: string[];
  byId: Record<string, ComposedNode>;
  onNavigate(specId: string): void;
}): JSX.Element {
  const linkedIds = props.specIds.filter((specId) => props.byId[specId]);

  return (
    <section className="detail-section">
      <h3>{props.title}</h3>
      {linkedIds.length > 0 ? (
        <div className="detail-link-list">
          {linkedIds.map((specId) => (
            <button type="button" key={specId} className="detail-link" onClick={() => props.onNavigate(specId)}>
              <span>{specId}</span>
              <strong>{props.byId[specId].spec.title}</strong>
            </button>
          ))}
        </div>
      ) : (
        <p className="detail-empty">not set</p>
      )}
    </section>
  );
}

export function Detail(props: {
  composeResult?: ComposeRepositoryResult;
  selectedItemId?: string;
  onNavigate(specId: string): void;
}): JSX.Element {
  const byId = useMemo<Record<string, ComposedNode>>(() => {
    return Object.fromEntries((props.composeResult?.composedNodes ?? []).map((node) => [node.spec.id, node]));
  }, [props.composeResult]);

  const selectedNode = props.selectedItemId ? byId[props.selectedItemId] : undefined;

  if (!selectedNode) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Item detail</h2>
            <p>Select a node from overview, tree, or board to inspect canonical and overlay fields.</p>
          </div>
        </div>
        <p className="quick-pick-empty">No detail target selected yet.</p>
      </section>
    );
  }

  const parentIds = selectedNode.spec.parentId ? [selectedNode.spec.parentId] : [];
  const triageBadges = getTriageBadges(selectedNode);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Item detail</h2>
          <p>
            {selectedNode.spec.id} · {selectedNode.spec.type}
          </p>
        </div>
        <div className="panel-pill">{selectedNode.spec.title}</div>
      </div>

      <section className="detail-section">
        <h3>Summary</h3>
        <p>{selectedNode.spec.summary || "not set"}</p>
        {triageBadges.length > 0 ? (
          <div className="detail-triage-badges" aria-label="Triage indicators">
            {triageBadges.map((badge) => (
              <span
                key={badge.kind}
                className={
                  badge.kind === "blocked"
                    ? "detail-triage-badge detail-triage-badge--blocked"
                    : "detail-triage-badge detail-triage-badge--dependencies"
                }
                title={badge.title}
              >
                {badge.label}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <FieldList title="Goals" items={selectedNode.spec.goals ?? []} />
      <FieldList title="Requirements" items={selectedNode.spec.requirements ?? []} />
      <FieldList title="Acceptance criteria" items={selectedNode.spec.acceptanceCriteria ?? []} />
      <LinkGroup
        title="Dependencies"
        specIds={selectedNode.spec.dependencies ?? []}
        byId={byId}
        onNavigate={props.onNavigate}
      />

      <section className="detail-section">
        <h3>Overlay</h3>
        <dl className="detail-overlay-grid">
          <OverlayField label="Status" value={selectedNode.overlay?.planningStatus} />
          <OverlayField label="Rank" value={selectedNode.overlay?.rank} />
          <OverlayField label="Blocked" value={selectedNode.overlay?.blocked} />
          <OverlayField label="Blocked reason" value={selectedNode.overlay?.blockedReason} />
          <OverlayField label="Dependency refs" value={selectedNode.overlay?.dependencies?.length ?? 0} />
          <OverlayField label="Tags" value={selectedNode.overlay?.tags} />
          <OverlayField label="Notes" value={selectedNode.overlay?.notes} />
        </dl>
      </section>

      <LinkGroup title="Parent" specIds={parentIds} byId={byId} onNavigate={props.onNavigate} />
      <LinkGroup
        title="Children"
        specIds={selectedNode.spec.childrenIds}
        byId={byId}
        onNavigate={props.onNavigate}
      />
    </section>
  );
}
