$ErrorActionPreference = "Stop"
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$RuntimePath = Join-Path $ScriptPath "..\tools\specforge-cli.mjs"
node $RuntimePath @args
exit $LASTEXITCODE
