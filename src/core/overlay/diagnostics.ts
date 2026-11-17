import type { CompositionDiagnostic, ValidationFinding } from "../model/types.ts";

export function overlayDiagnosticToFinding(diagnostic: CompositionDiagnostic): ValidationFinding | undefined {
  let ruleId: string;
  let severity: ValidationFinding["severity"] = "error";
  let remediationHint: string;
  if (diagnostic.code === "unknown-overlay-specid") {
    ruleId = "V-101";
    severity = "warning";
    remediationHint = "Update the overlay entry to point at an existing spec ID.";
  } else if (diagnostic.code === "invalid-overlay-entry" && diagnostic.sectionName === "planningStatus") {
    ruleId = "V-102";
    remediationHint = "Use one of the supported planningStatus values.";
  } else if (diagnostic.code === "invalid-overlay-entry" && diagnostic.sectionName === "rank") {
    ruleId = "V-103";
    severity = "warning";
    remediationHint = "Set rank to a positive integer.";
  } else if (diagnostic.code === "invalid-execution-slice") {
    ruleId = "V-200";
    remediationHint = "Repair the execution slice so every field matches the version 0.2 overlay contract.";
  } else if (["invalid-overlay-entry", "invalid-overlay-json", "invalid-overlay-file",
    "invalid-overlay-version", "invalid-overlay-repository-id", "overlay-read-failed"].includes(diagnostic.code)) {
    ruleId = "V-105";
    remediationHint = "Repair the reported overlay field. Omit blockedReason when there is no reason; otherwise use a non-empty string. Rejected entries do not contribute planning metadata.";
  } else {
    return undefined;
  }
  return { ruleId, severity, message: diagnostic.message, specId: diagnostic.specId,
    sourcePaths: [diagnostic.sourcePath], remediationHint };
}
