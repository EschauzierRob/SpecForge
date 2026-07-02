# Local Developer Workflow

## Prerequisites

- Node.js 22 or newer
- A local repository that follows the SpecForge `specs/` and `specforge/overlay/` layout

For AI-assisted implementation work, follow `docs/ai-overlay-sync-workflow.md` before and after making changes. That workflow is the required path for validating and repairing `specforge/overlay/local-dev.overlay.json`.

## Commands

Use `compose` and `validate` after overlay edits to confirm the local overlay file still composes cleanly and does not introduce validation findings.

Repositories bootstrapped with SpecForge include local launchers under `specforge/bin/`. Prefer those commands in connected repositories:

```powershell
specforge/bin/specforge validate .
```

### Parse

Use `parse` when you want the canonical spec snapshot and parser diagnostics only.

```powershell
node --experimental-strip-types ./src/cli.ts parse .
```

Machine-readable output:

```powershell
node --experimental-strip-types ./src/cli.ts parse . --json
```

### Compose

Use `compose` when you want canonical data plus overlay composition and composition diagnostics.

```powershell
node --experimental-strip-types ./src/cli.ts compose .
```

Machine-readable output:

```powershell
node --experimental-strip-types ./src/cli.ts compose . --json
```

### Validate

Use `validate` when you want rule-based findings and severity counts.

```powershell
node --experimental-strip-types ./src/cli.ts validate .
```

Machine-readable output:

```powershell
node --experimental-strip-types ./src/cli.ts validate . --json
```

### Ingest Compatibility Alias

`ingest` remains supported as a compatibility alias for `compose`.

```powershell
node --experimental-strip-types ./src/cli.ts ingest .
```

## Writing JSON Artifacts

Every command supports `--output <path>` to write the JSON payload to disk.

Example:

```powershell
node --experimental-strip-types ./src/cli.ts compose . --output artifacts/specforge/compose.json
```

Behavior:

- `--output` writes JSON and creates parent directories when needed
- without `--json`, the command still prints the normal summary to stdout
- with `--json`, the command prints JSON to stdout and also writes the same JSON to the output path

## Exit Codes

- `parse`: `0` on successful execution
- `compose`: `0` on successful execution
- `ingest`: `0` on successful execution
- `validate`: `0` when there are no error-level findings, `1` when error-level findings exist
- unrecoverable startup or filesystem failures surface as command failures rather than validation results

## NPM Scripts

For convenience, the repository exposes:

- `npm run parse`
- `npm run compose`
- `npm run ingest`
- `npm run validate`
- `npm run ui:server`
- `npm run ui:client`
- `npm run ui:build`
- `npm test`

## UI Foundation Workflow

Slice 5 adds a local API bridge plus a React + Vite workspace under `ui/`.

### One-time setup

Install the UI dependencies:

```powershell
npm --prefix ui install
```

### Start the local API bridge

Run the Node API bridge in one terminal:

```powershell
npm run ui:server
```

The bridge exposes:

- `GET /api/context`
- `POST /api/parse`
- `POST /api/compose`
- `POST /api/validate`

### Start the UI

Run the Vite client in a second terminal:

```powershell
npm run ui:client
```

Open the Vite URL shown in the terminal, then:

1. Confirm the repository path is prefilled from the local API context.
2. Click `Load workspace`.
3. Use the `Overview` tab to inspect counts, quick selection state, and the raw payload inspector.

### Build the UI

Use this when you want to confirm the client bundle compiles cleanly:

```powershell
npm run ui:build
```
