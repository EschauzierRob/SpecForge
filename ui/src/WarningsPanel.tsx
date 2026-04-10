import { useMemo } from "react";

import type { ComposeRepositoryResult, DiagnosticSeverity, ValidationResult } from "./lib/contracts";
import {
  filterValidationFindings,
  getFindingNavigationSpecId,
  getFindingRuleIds,
  getWarningsEmptyState,
  groupFindingsBySeverity,
  type WarningsFilters,
} from "./lib/selectors";

const SEVERITY_ORDER: DiagnosticSeverity[] = ["error", "warning", "info"];

export function WarningsPanel(props: {
  validationResult?: ValidationResult;
  composeResult?: ComposeRepositoryResult;
  filters: WarningsFilters;
  onFiltersChanged(nextFilters: WarningsFilters): void;
  onFindingSelected(specId: string): void;
}): JSX.Element {
  const findings = props.validationResult?.findings ?? [];
  const filteredFindings = useMemo(() => filterValidationFindings(findings, props.filters), [findings, props.filters]);
  const groupedFindings = useMemo(() => groupFindingsBySeverity(filteredFindings), [filteredFindings]);
  const ruleIds = useMemo(() => getFindingRuleIds(props.validationResult), [props.validationResult]);
  const emptyState = getWarningsEmptyState(findings.length, filteredFindings.length);

  const toggleSeverity = (severity: DiagnosticSeverity): void => {
    props.onFiltersChanged({
      ...props.filters,
      severity: {
        ...props.filters.severity,
        [severity]: !props.filters.severity[severity],
      },
    });
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Validation findings</h2>
          <p>Inspect findings by severity and rule id, then jump directly to matching specs when available.</p>
        </div>
      </div>

      <div className="warnings-toolbar" role="group" aria-label="Findings filters">
        <div className="warnings-severity-toggles">
          {SEVERITY_ORDER.map((severity) => {
            const enabled = props.filters.severity[severity];
            return (
              <button
                key={severity}
                type="button"
                className={enabled ? "warnings-toggle warnings-toggle--active" : "warnings-toggle"}
                onClick={() => toggleSeverity(severity)}
                aria-pressed={enabled}
              >
                {severity}
              </button>
            );
          })}
        </div>

        <label className="warnings-rule-filter">
          <span>Rule ID</span>
          <input
            list="warnings-rule-options"
            value={props.filters.ruleIdQuery}
            onChange={(event) => props.onFiltersChanged({ ...props.filters, ruleIdQuery: event.target.value })}
            placeholder="Filter by rule id"
          />
          <datalist id="warnings-rule-options">
            {ruleIds.map((ruleId) => (
              <option key={ruleId} value={ruleId} />
            ))}
          </datalist>
        </label>
      </div>

      {emptyState === "no-findings" ? <div className="quick-pick-empty">No findings.</div> : null}
      {emptyState === "no-matches" ? <div className="quick-pick-empty">No matches for current filters.</div> : null}

      {emptyState ? null : (
        <div className="warnings-list">
          {SEVERITY_ORDER.map((severity) =>
            groupedFindings[severity].map((finding, index) => {
              const targetSpecId = getFindingNavigationSpecId(finding, props.composeResult);
              return (
                <article key={`${finding.ruleId}-${severity}-${index}-${finding.message}`} className="warnings-item">
                  <header className="warnings-item-header">
                    <span className={`severity-badge severity-badge--${severity}`}>{severity}</span>
                    <strong>{finding.ruleId}</strong>
                    {targetSpecId ? (
                      <button type="button" className="warnings-link" onClick={() => props.onFindingSelected(targetSpecId)}>
                        Open {targetSpecId}
                      </button>
                    ) : null}
                  </header>
                  <p className="warnings-message">{finding.message}</p>
                  <p className="warnings-source-paths">Source: {finding.sourcePaths.join(", ")}</p>
                </article>
              );
            }),
          )}
        </div>
      )}
    </section>
  );
}
