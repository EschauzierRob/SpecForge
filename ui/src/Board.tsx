import { useMemo } from "react";

import type { ComposeRepositoryResult } from "./lib/contracts";
import { getBlockedReason, getBoardLanes } from "./lib/selectors";

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

  if (!props.composeResult || props.composeResult.composedNodes.length === 0) {
    return <div className="board-empty">No board data loaded yet.</div>;
  }

  return (
    <div className="board-grid">
      {lanes.map((lane) => (
        <section className="board-lane" key={lane.status} aria-label={`${laneLabels[lane.status]} lane`}>
          <header className="board-lane-header">
            <h3>{laneLabels[lane.status]}</h3>
            <span className="board-lane-count">{lane.count}</span>
          </header>

          <div className="board-lane-items">
            {lane.nodes.map((node) => {
              const blockedReason = getBlockedReason(node);
              return (
                <button
                  key={node.spec.id}
                  type="button"
                  onClick={() => props.onSelect(node.spec.id)}
                  className={node.spec.id === props.selectedItemId ? "board-card board-card--active" : "board-card"}
                >
                  <span className="board-card-id">{node.spec.id}</span>
                  <strong>{node.spec.title}</strong>
                  <span className="board-card-type">{node.spec.type}</span>
                  {node.overlay?.blocked ? (
                    <span className="board-card-blocked" title={blockedReason} aria-label={`Blocked: ${blockedReason}`}>
                      Blocked
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
