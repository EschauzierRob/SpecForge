import { useMemo, useState } from "react";

import type { ComposeRepositoryResult, SpecNodeType } from "./lib/contracts";
import { BOARD_ITEM_TYPES, createBoardFilters, getBoardModel, getTriageBadges } from "./lib/selectors";
import type { BoardCard, BoardParentContext, BoardProgress } from "./lib/selectors";

const laneLabels: Record<string, string> = {
  unplanned: "Unplanned", backlog: "Backlog", ready: "Ready", in_progress: "In Progress", done: "Done",
};
const typeLabels: Record<SpecNodeType, string> = {
  epic: "Epic", feature: "Feature", story: "Story", task: "Task",
};
const typeSymbols: Record<SpecNodeType, string> = { epic: "◆", feature: "▣", story: "▤", task: "✓" };

function Progress(props: { label: string; progress: BoardProgress }): JSX.Element {
  return <span className="board-progress">{props.label}: {props.progress.completed}/{props.progress.total} complete</span>;
}

function ParentContext(props: { parent: BoardParentContext; onSelect(specId: string): void }): JSX.Element {
  const { parent } = props;
  const label = typeLabels[parent.type];
  const node = parent.node;
  if (!node) {
    return <span className="board-parent board-parent--unresolved">
      {parent.id ? `${label}: ${parent.id} · unresolved context` : `${label}: missing parent`}
    </span>;
  }
  return <button type="button" className="board-parent board-parent--link"
    aria-label={`Open ${label} ${node.spec.id}: ${node.spec.title}`}
    onClick={() => props.onSelect(node.spec.id)}>
    {label}: {node.spec.id} · {node.spec.title}
  </button>;
}

function Card(props: { card: BoardCard; selectedItemId?: string; onSelect(specId: string): void }): JSX.Element {
  const { node, parent, progress } = props.card;
  const selected = node.spec.id === props.selectedItemId;
  const badges = getTriageBadges(node);
  return <article className={[
    "board-card", `board-card--${node.spec.type}`, selected ? "board-card--active" : "",
    node.overlay?.blocked ? "board-card--blocked" : "",
  ].filter(Boolean).join(" ")} aria-label={`${typeLabels[node.spec.type]} ${node.spec.id}`}>
    <button type="button" className="board-card-select" onClick={() => props.onSelect(node.spec.id)}
      aria-label={`Open ${typeLabels[node.spec.type]} ${node.spec.id}: ${node.spec.title}`} aria-pressed={selected}>
      <span className="board-card-type"><span aria-hidden="true">{typeSymbols[node.spec.type]} </span>{typeLabels[node.spec.type]}</span>
      <span className="board-card-id">{node.spec.id}</span>
      <strong>{node.spec.title}</strong>
      {progress ? <Progress label="Tasks" progress={progress} /> : null}
      {badges.length ? <span className="board-card-badges">{badges.map((badge) => (
        <span key={badge.kind} className={`board-card-badge board-card-badge--${badge.kind}`} title={badge.title}>
          {badge.label}
        </span>
      ))}</span> : null}
    </button>
    {parent && (node.spec.type !== "story" || !parent.node)
      ? <ParentContext parent={parent} onSelect={props.onSelect} /> : null}
  </article>;
}

export function Board(props: {
  composeResult?: ComposeRepositoryResult;
  selectedItemId?: string;
  onSelect(specId: string): void;
}): JSX.Element {
  const [filters, setFilters] = useState(createBoardFilters);
  const model = useMemo(() => getBoardModel(props.composeResult, filters), [props.composeResult, filters]);

  if (!props.composeResult || props.composeResult.composedNodes.length === 0) {
    return <div className="board-empty">No board data loaded yet.</div>;
  }

  return <>
    <div className="board-filters">
      <fieldset className="board-type-filters">
        <legend>Item types</legend>
        {BOARD_ITEM_TYPES.map((type) => <label className="board-filter" key={type}>
          <input type="checkbox" checked={filters.selectedTypes?.includes(type) ?? false}
            onChange={(event) => {
              const checked = event.target.checked;
              setFilters((current) => ({ ...current, selectedTypes: checked
                ? [...(current.selectedTypes ?? []), type]
                : current.selectedTypes?.filter((selectedType) => selectedType !== type) }));
            }} />
          {typeLabels[type]}
        </label>)}
      </fieldset>
      <fieldset className="board-type-filters">
        <legend>Quick filters</legend>
        <label className="board-filter"><input type="checkbox" checked={filters.showDoneInCompletedFeatures ?? false}
          onChange={(event) => {
            const checked = event.target.checked;
            setFilters((current) => ({ ...current, showDoneInCompletedFeatures: checked }));
          }} />Show done in completed Features</label>
        <label className="board-filter"><input type="checkbox" checked={filters.blockedOnly}
          onChange={(event) => {
            const checked = event.target.checked;
            setFilters((current) => ({ ...current, blockedOnly: checked }));
          }} />Blocked only</label>
        <label className="board-filter"><input type="checkbox" checked={filters.hasDependencies}
          onChange={(event) => {
            const checked = event.target.checked;
            setFilters((current) => ({ ...current, hasDependencies: checked }));
          }} />Has dependencies</label>
      </fieldset>
    </div>
    <div className="board-scroll" role="region" aria-label="Planning board by Feature and status" tabIndex={0}>
      <div className="board-matrix">
        <div className="board-grid board-status-row">
          <div className="board-row-context board-status-context">Feature / context</div>
          {model.lanes.map((lane) => <div className="board-lane-header" key={lane.status}>
            <h3>{laneLabels[lane.status]}</h3>
            <span className="board-lane-count" aria-label={`${lane.count} visible items in ${laneLabels[lane.status]}`}>{lane.count}</span>
          </div>)}
        </div>
        {model.groups.map((group) => <section className="board-grid board-feature-row" key={group.id}
          aria-label={group.feature ? `${group.feature.spec.id} ${group.title}` : group.title}>
          <header className="board-row-context">
            {group.feature ? <span className="board-card-id">{group.feature.spec.id}</span> : null}
            <h3>{group.title}</h3>
            {group.progress ? <Progress label="Stories" progress={group.progress} /> : null}
            {group.parent ? <ParentContext parent={group.parent} onSelect={props.onSelect} /> : null}
          </header>
          {group.lanes.map((lane) => <div className="board-lane" key={lane.status} role="group"
            aria-label={`${laneLabels[lane.status]} in ${group.feature?.spec.id ?? group.title}`}>
            {lane.cards.map((card) => <Card key={card.node.spec.id} card={card}
              selectedItemId={props.selectedItemId} onSelect={props.onSelect} />)}
          </div>)}
        </section>)}
      </div>
    </div>
    {model.groups.length === 0 ? <p className="board-empty" role="status">No matching items. Adjust the Board filters.</p> : null}
  </>;
}
