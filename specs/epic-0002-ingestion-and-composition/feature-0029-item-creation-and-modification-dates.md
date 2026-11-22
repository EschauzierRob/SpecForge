# Item Creation and Last Modification Dates

## ID
F-0029

## Type
Feature

## Parent
E-0002

## Summary
Register and maintain creation and last modification dates for every Epic, Feature, Story, and Task, recovering missing dates from Git history when they cannot be extracted from item text or metadata.

## Problem / Context
Users need to know when an item originated and when it last changed. Existing repositories may already contain dates in spec text or metadata, while older items may have no explicit dates at all. File creation and modification times are unreliable because cloning, checking out, or copying a repository changes them. Git history provides a recoverable source for missing dates, provided the history is traced to the item rather than blindly assigning file-level dates.

## Goals
- Expose creation and last modification dates consistently for all four canonical item types.
- Reuse explicit dates before consulting Git history for missing information.
- Preserve the origin and precision of each resolved date.
- Keep dates accurate as items are created, edited, moved, and reloaded.

## Non-goals
- Build a general audit log, revision browser, or author attribution feature.
- Automatically commit, push, rewrite history, or fetch additional remote history.
- Treat repository synchronization times, file system timestamps, or ingestion times as item lifecycle dates.

## Requirements
- [ ] R1: Every composed Epic, Feature, Story, and Task exposes `createdAt` and `updatedAt`, each with a resolved value or an explicit unknown state; resolution is independent for the two fields.
- [ ] R2: For each field, prefer valid item-specific structured metadata, then an explicitly labelled date in item text, then Git history. Recognize documented creation and last-modification labels rather than interpreting arbitrary dates in requirements, examples, or prose as lifecycle dates. Report conflicting or invalid explicit values with their source locations; an invalid candidate does not prevent fallback to the next valid source.
- [ ] R3: Retain provenance per field: metadata or text location for explicit values, or commit identifier and historical item path for Git-derived values. Distinguish exact timestamps, date-only values, incomplete-history estimates, and unknown results. Normalize timestamps with an explicit offset to UTC and preserve date-only precision without inventing a time or timezone.
- [ ] R4: For a missing creation date, trace the stable spec ID through history reachable from the inspected revision and use the committer timestamp of the commit that first introduced that item. For a missing last modification date, use the committer timestamp of the latest reachable commit that changed that item's canonical content or its own overlay entry. Use repository ancestry to select introduction and latest change rather than sorting timestamp values.
- [ ] R5: Follow historical renames and moves while retaining item identity by spec ID. Changes to another item in the same file or another entry in a shared overlay must not change this item's dates. Moving a file without changing item content preserves both dates; formatting-only changes to the shared container are not item changes.
- [ ] R6: Resolve history against the revision actually being inspected for both local Git repositories and acquired Git-backed projects. Do not use commits from unrelated branches or newer remote revisions. Source acquisition remains separate from date resolution, and read-only project capabilities remain respected.
- [ ] R7: When Git is unavailable, the source is not versioned, the item is untracked, history is shallow or incomplete, or item identity cannot be established unambiguously, preserve all reliable explicit values and report the limitation per unresolved field. A shallow-history boundary is not proof of creation: any earliest-visible creation candidate is labelled an estimate rather than a confirmed creation date. Missing history must not prevent loading the repository.
- [ ] R8: Successful item creation through SpecForge records both dates using the same creation instant. A successful save that changes canonical item content or that item's overlay entry preserves `createdAt` and advances `updatedAt`; a failed save, no-op save, view, parse, compose, or refresh does not advance either value. Timestamp bookkeeping itself must not trigger another modification.
- [ ] R9: Existing items without persisted dates are enriched during ingestion without silently rewriting canonical files or overlays. Explicit date persistence during an authorized write follows the documented canonical/overlay boundary and preserves the original creation date and its provenance. Reloading unchanged data produces the same resolved values.
- [ ] R10: Uncommitted item changes without a trustworthy recorded modification timestamp are identified as pending changes; the Git-derived last committed modification date remains labelled as such. Do not substitute the current time on each refresh or imply that a committed date covers newer working-tree edits.
- [ ] R11: Expose the resolved values, precision, provenance, and limitations in composed API/CLI output and the item detail view. Unknown dates are shown as unknown, and date-only values remain date-only. Display timestamps with an explicit timezone indication.
- [ ] R12: Detect and report a last modification date earlier than the creation date without silently clamping or replacing either value. Diagnostics explain the selected sources so users can correct conflicting metadata or understand inconsistent commit clocks.

## Acceptance Criteria
- [ ] AC1: Fixtures covering all four canonical item types expose both date fields and their provenance through composition and item details.
- [ ] AC2: An item with valid explicit dates uses those dates without substituting Git dates. If only creation is explicit, Git supplies only the missing last modification date; the reverse case resolves only creation from Git. Conflicting metadata and text follow the documented precedence and produce a diagnostic.
- [ ] AC3: An item introduced in commit A and changed in commit C resolves to the committer timestamps of A and C, while commit B changing an unrelated item or overlay entry does not affect its dates. A later path-only rename preserves both values and traceable provenance.
- [ ] AC4: In a file containing multiple supported items, a commit adding or editing one item changes only that item's applicable dates. An item-specific overlay change affects its last modification date while preserving its creation date.
- [ ] AC5: Equivalent local and Git-backed sources inspected at the same revision resolve equivalent dates. A pinned or stale displayed revision never takes its dates from newer commits.
- [ ] AC6: Non-Git, untracked, shallow-history, and ambiguous-identity fixtures load successfully and expose field-specific unknown states or clearly labelled estimates. No result presents clone time, filesystem modification time, or load time as a recovered lifecycle date.
- [ ] AC7: Creating an item records matching creation and modification instants; a subsequent successful content change preserves creation and advances modification. Failed saves, no-op saves, and repeated refreshes leave dates unchanged, and ingestion of legacy specs does not rewrite source files.
- [ ] AC8: A local uncommitted edit without a recorded save timestamp displays a pending-change indication alongside the last committed modification date. Refreshing the view repeatedly does not manufacture a new modification date.
- [ ] AC9: Date-only input remains date-only, timestamps with offsets normalize to the same UTC instant, and invalid or chronologically inconsistent dates produce actionable diagnostics without crashing ingestion or hiding valid values.

## Dependencies
- F-0001
- F-0002
- F-0005
- F-0006

## Open Questions
- Which explicit date labels and legacy metadata aliases must be supported in addition to `createdAt` and `updatedAt`?
- Which canonical section and item-specific metadata representation should store dates written by authoring flows while preserving compatibility with existing repositories?

## Notes
This feature applies to canonical spec items and their own planning metadata, not execution slices or evidence records as independent items. Git-backed acquisition in F-0027 is complementary: local Git history recovery does not depend on remote repository support. F-0019 and F-0020 provide the creation and editing flows that must integrate lifecycle date maintenance when implemented. Reading history must not modify repository content.
