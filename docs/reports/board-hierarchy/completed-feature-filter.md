# SL-0005 Completed Feature work filter validation

Reviewed on 2026-11-18 for S-0207, T-0208, and the F-0028 extension. The original SL-0004 evidence remains unchanged.

## Implementation

The default-off Show done in completed Features checkbox excludes a card only when both that card and its resolved Feature have explicit done status. The existing full-model relationship lookup supplies the Feature; source nodes and progress calculations are unchanged. Open descendants retain their row context, completed work within ongoing Features remains eligible, and unresolved memberships and Epic cards are unaffected. The Done column stays visible.

## Automated results

- Nine Board tests pass, including four new tests for this Story. Both checkbox values are checked across all 64 existing type/quick-filter combinations (128 cases), with exact visible-card counts, no duplicate cards, stable progress, and source immutability.
- Cases cover open Tasks beneath hidden done Stories, completed children of ongoing Features, blocked metadata on done cards, missing statuses and overlays, unresolved or invalid parent chains, refresh, and a Board containing only completed work.
- UI production build and UI TypeScript check pass.
- Full `npm test`: 131 of 132 tests pass. The sole failure remains the pre-existing document-title expectation (`SpecForge UI` versus the unchanged `SpecForge` title helper), previously confirmed against HEAD and documented in SL-0004. The full suite is not reported as passing.
- SpecForge parse, compose, and validate report no diagnostics or findings after closure.

Commands: `node --experimental-strip-types --experimental-test-isolation=none --test --test-name-pattern=Board tests/ui-state.test.ts`, `npm test`, `npm --prefix ui run build`, `ui/node_modules/.bin/tsc --noEmit -p ui/tsconfig.json`, and `node --experimental-strip-types src/cli.ts <parse|compose|validate> .`.

## Browser results

Twenty-two Chrome DevTools Protocol checks pass against the local Vite UI at 1440 x 1000 CSS pixels using a browser-only compose-response fixture; no canonical fixture files are changed. The fixture contains completed and ongoing Features, open children under done parents, completed children under ongoing Features, and an unresolved Story.

Verified outcomes include the unchecked default, disappearing fully completed rows, retained open children and progress, unchanged Done column, mouse toggling, Space activation and focus visibility, existing quick-filter combinations, and selection/detail-drawer retention when the selected card is hidden. Refresh retains the checkbox value and uses updated data. Returning to Board, switching repository, and reloading reset it. An all-finished Board shows the no-matches state until the checkbox restores eligible cards. No nested buttons or runtime exceptions were observed.

An additional 375 x 900 CSS-pixel geometry check confirms the checkbox fits inside its fieldset and does not introduce page-wide overflow. The session harness and raw results are ignored local artifacts under `node_modules/.cache/review-completed-filter.mjs` and `node_modules/.cache/completed-filter-browser-results.json`; maintained regression coverage is in `tests/ui-state.test.ts`.

## Outcome

SL-0005 is validated with no introduced failures. The previously existing document-title test failure remains outside this slice.
