# SL-0004 Board hierarchy validation

Reviewed on 2026-11-18 for F-0028, S-0203 through S-0206, and T-0203 through T-0207. F-0008 supplies the existing Board contract; its older tag-filter requirement is outside this slice and remains unimplemented.

## Automated checks

- Five new Board tests in `tests/ui-state.test.ts` pass. They cover all 64 combinations of the sixteen type selections and four quick-filter states, cross-status Feature rows, exact card counts, unresolved and cyclic chains, parent references, direct-child progress, refresh, deterministic ordering, and source immutability.
- `npm test`: 127 of 128 tests pass. The sole failure is the pre-existing document-title assertion: it expects `SpecForge UI - BitBetMatic_2.0`, while the unchanged title helper returns `SpecForge - BitBetMatic_2.0`. Both the helper and original assertion were confirmed in HEAD; this slice does not change their behavior.
- CLI and ingestion tests now derive the slice count from composed overlay data instead of assuming three slices.
- `npm --prefix ui run build` and `ui/node_modules/.bin/tsc --noEmit -p ui/tsconfig.json` pass.
- SpecForge parse, compose, and validate complete without diagnostics or findings after slice closure.

## Browser review

Chrome headless was driven through the DevTools Protocol against the local Vite UI. The actual repository Board loaded successfully, with Feature and Story defaults, 67 visible cards, 28 Feature rows, and no nested buttons or runtime exceptions. A browser-only compose-response fixture then supplied two Epics, a cross-status Feature, a childless Feature, mixed-status Tasks, and unresolved parents; no canonical repository fixture was edited.

Twenty-four scripted browser checks passed at 1440 x 1000 and 375 x 900 CSS pixels:

- Default type selection, optional Epic and Task placement, four distinct non-color card treatments, visible-card totals, and unresolved references.
- Card mouse selection and existing drawer/URL integration; parent navigation by Enter and mouse; type selection by Space; hidden parent types stay hidden.
- Progress remains correct with hidden Tasks and combined quick filters. Refresh updates Task progress from 3/5 to 4/5 while retaining filters.
- Empty selection shows no matches. Returning to Board and loading a different repository reset filters.
- Mobile overflow stays inside the Board, the Done column is reachable, row context remains horizontally visible, and the scroll region accepts keyboard focus.
- No nested interactive buttons or runtime exceptions. A dark-theme smoke check confirmed distinct card text and background colors.

Visual inspection found the initial mobile side header obscured part of the last card. The final mobile layout puts each row header above its cards; an additional geometry check confirmed the Done card is fully visible and the header does not overlap it. Desktop retains a left context column. Screenshots show the final layout with all four types enabled and refreshed Task progress.

- [Desktop review](desktop.png)
- [Mobile review](mobile.png)

The temporary CDP harness and raw results were session artifacts under the ignored `node_modules/.cache` directory. The maintained regression coverage is in the existing test suite; the screenshots and this report retain the browser evidence.

## Outcome

The slice is validated with no introduced test failures. The full suite still reports the documented pre-existing title mismatch; it is not reported as a passing test run. No tag filter, status editing, persisted filters, or API changes were added.
