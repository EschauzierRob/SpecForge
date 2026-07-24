import type { ComposeRepositoryResult, ExecutionSlice } from "./lib/contracts";
import { getExecutionSlices } from "./lib/selectors";

function TextList(props: { items: string[]; empty: string }): JSX.Element {
  if (props.items.length === 0) {
    return <p className="slice-empty">{props.empty}</p>;
  }

  return <ul className="slice-list">{props.items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function CriteriaList(props: { criteria: ExecutionSlice["entryCriteria"] }): JSX.Element {
  return (
    <ul className="slice-list">
      {props.criteria.map((criterion) => (
        <li key={criterion.criterionId}>
          <span className={criterion.met ? "slice-result slice-result--passed" : "slice-result"}>
            {criterion.met ? "met" : "open"}
          </span>
          <strong>{criterion.criterionId}</strong> {criterion.description}
        </li>
      ))}
    </ul>
  );
}

export function Slices(props: {
  composeResult?: ComposeRepositoryResult;
  onOpenSpec(specId: string): void;
}): JSX.Element {
  const slices = getExecutionSlices(props.composeResult);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Execution slices</h2>
          <p>Bounded thematic execution, evidence, and decisions remain separate from the canonical hierarchy.</p>
        </div>
        <div className="panel-pill">{slices.length} slices</div>
      </div>

      {slices.length === 0 ? (
        <div className="quick-pick-empty">No execution slices are defined in the loaded overlays.</div>
      ) : null}

      <div className="slice-grid">
        {slices.map(({ slice, sourcePath }) => {
          const active = slice.planningStatus === "in_progress" || slice.planningStatus === "blocked";
          return (
            <article className={active ? "slice-card slice-card--active" : "slice-card"} key={`${sourcePath}:${slice.sliceId}`}>
              <header className="slice-card__header">
                <div>
                  <span className="quick-pick-id">{slice.sliceId}</span>
                  <h3>{slice.title}</h3>
                </div>
                <div className="slice-badges">
                  <span className="tree-badge">{slice.planningStatus}</span>
                  {slice.resolution ? <span className="tree-badge">{slice.resolution}</span> : null}
                </div>
              </header>

              <p>{slice.objective}</p>
              {slice.hypothesis ? <p><strong>Hypothesis:</strong> {slice.hypothesis}</p> : null}

              <div className="slice-columns">
                <div>
                  <h4>Entry criteria</h4>
                  <CriteriaList criteria={slice.entryCriteria} />
                </div>
                <div>
                  <h4>Exit criteria</h4>
                  <CriteriaList criteria={slice.exitCriteria} />
                </div>
              </div>

              <div className="slice-columns">
                <div>
                  <h4>Included scope</h4>
                  <TextList items={slice.scope.included} empty="No included scope recorded." />
                </div>
                <div>
                  <h4>Excluded scope</h4>
                  <TextList items={slice.scope.excluded} empty="No excluded scope recorded." />
                </div>
              </div>

              <h4>Planned work</h4>
              <div className="slice-work">
                {slice.work.map((work) => (
                  <button type="button" key={work.workId} onClick={() => props.onOpenSpec(work.specId)}>
                    <span>{work.workId} · {work.type}</span>
                    <strong>{work.specId}</strong>
                    <span>{work.description}</span>
                  </button>
                ))}
              </div>

              <div className="slice-columns">
                <div>
                  <h4>Required evidence</h4>
                  <ul className="slice-list">
                    {slice.requiredEvidence.map((evidence) => (
                      <li key={evidence.evidenceId}><strong>{evidence.evidenceId}</strong> {evidence.description}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Observed evidence</h4>
                  {slice.observedEvidence.length === 0 ? <p className="slice-empty">No evidence observed yet.</p> : (
                    <ul className="slice-list">
                      {slice.observedEvidence.map((evidence) => (
                        <li key={evidence.evidenceId}>
                          <span className={`slice-result slice-result--${evidence.assessment}`}>{evidence.assessment}</span>
                          <strong>{evidence.evidenceId}</strong> {evidence.description}
                          <small>Satisfies: {evidence.satisfies.join(", ") || "entry/auxiliary evidence"}</small>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {slice.blockers.length > 0 ? (
                <>
                  <h4>Blockers</h4>
                  <TextList
                    items={slice.blockers.map((blocker) => `${blocker.status}: ${blocker.description}`)}
                    empty="No blockers."
                  />
                </>
              ) : null}

              {slice.decisions.length > 0 ? (
                <>
                  <h4>Decisions</h4>
                  <TextList
                    items={slice.decisions.map((decision) => `${decision.decisionId}: ${decision.decision}${decision.reason ? ` — ${decision.reason}` : ""}`)}
                    empty="No decisions."
                  />
                </>
              ) : null}

              <footer className="slice-next-action">
                <span>Next action</span>
                <strong>{slice.nextAction || "No next action recorded."}</strong>
                <small>{sourcePath}</small>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
