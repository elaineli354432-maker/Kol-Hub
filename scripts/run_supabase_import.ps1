$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$bundledPython = "C:\Users\HUAWEI\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$scriptPath = Join-Path $PSScriptRoot "import_local_state_to_supabase.py"
$envPath = Join-Path $projectRoot ".env.local"

if (-not (Test-Path $envPath)) {
    throw ".env.local not found: $envPath"
}

if (Test-Path $bundledPython) {
    & $bundledPython $scriptPath
    exit $LASTEXITCODE
}

if (Get-Command python -ErrorAction SilentlyContinue) {
    & python $scriptPath
    exit $LASTEXITCODE
}

throw "Python not found. Please install Python or run this inside Codex desktop."
