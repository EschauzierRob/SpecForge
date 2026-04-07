# Local Developer Workflow

## Prerequisites

- Node.js 22 or newer
- A local repository that follows the SpecForge `specs/` and `specforge/overlay/` layout

## Commands

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
- `npm test`
