import { useMemo, useState } from "react";

import type { ComposeRepositoryResult } from "./lib/contracts";
import { filterBoardNodes, getBoardLanes, getTriageBadges } from "./lib/selectors";

const laneLabels: Record<string, string> = {
  backlog: "Backlog",
  ready: "Ready",
  in_progress: "In Progress",
  done: "Done",
  unplanned: "Unplanned",
};

export function Board(props: {
  composeResult?: ComposeRepositoryResult;
  selectedItemId?: string;
  onSelect(specId: string): void;
}): JSX.Element {
  const lanes = useMemo(() => getBoardLanes(props.composeResult), [props.composeResult]);
  const [blockedOnly, setBlockedOnly] = useState(false);
  const [hasDependencies, setHasDependencies] = useState(false);

  if (!props.composeResult || props.composeResult.composedNodes.length === 0) {
    return <div className="board-empty">No board data loaded yet.</div>;
  }

  return (
    <>
      <div className="board-filters" aria-label="Board quick filters">
        <label className="board-filter">
          <input
            type="checkbox"
            checked={blockedOnly}
            onChange={(event) => setBlockedOnly(event.target.checked)}
          />
          Blocked only
        </label>
        <label className="board-filter">
          <input
            type="checkbox"
            checked={hasDependencies}
            onChange={(event) => setHasDependencies(event.target.checked)}
          />
          Has dependencies
        </label>
      </div>
      <div className="board-grid">
      {lanes.map((lane) => (
        <section className="board-lane" key={lane.status} aria-label={`${laneLabels[lane.status]} lane`}>
          <header className="board-lane-header">
            <h3>{laneLabels[lane.status]}</h3>
            <span className="board-lane-count">
              {filterBoardNodes(lane.nodes, { blockedOnly, hasDependencies }).length}/{lane.count}
            </span>
          </header>

          <div className="board-lane-items">
            {filterBoardNodes(lane.nodes, { blockedOnly, hasDependencies }).map((node) => {
              const triageBadges = getTriageBadges(node);
              return (
                <button
                  key={node.spec.id}
                  type="button"
                  onClick={() => props.onSelect(node.spec.id)}
                  className={[
                    "board-card",
                    node.spec.id === props.selectedItemId ? "board-card--active" : "",
                    node.overlay?.blocked ? "board-card--blocked" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="board-card-id">{node.spec.id}</span>
                  <strong>{node.spec.title}</strong>
                  <span className="board-card-type">{node.spec.type}</span>
                  <div className="board-card-badges">
                    {triageBadges.map((badge) => (
                      <span
                        key={badge.kind}
                        className={
                          badge.kind === "blocked"
                            ? "board-card-badge board-card-badge--blocked"
                            : "board-card-badge board-card-badge--dependencies"
                        }
                        title={badge.title}
                      >
                        {badge.label}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
      </div>
    </>
  );
}
