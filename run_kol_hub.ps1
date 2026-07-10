param(
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$bundledPython = "C:\Users\HUAWEI\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$serverScript = Join-Path $projectRoot "server.py"
$candidatePorts = @(4274, 4275, 4276, 4277, 4278)

function Test-PortAvailable {
    param(
        [int]$Port
    )

    $listener = $null
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
        $listener.Start()
        return $true
    } catch {
        return $false
    } finally {
        if ($listener -ne $null) {
            $listener.Stop()
        }
    }
}

$selectedPort = $candidatePorts | Where-Object { Test-PortAvailable $_ } | Select-Object -First 1
if (-not $selectedPort) {
    throw "No free port found in: $($candidatePorts -join ', ')"
}

$env:KOL_HUB_PORT = [string]$selectedPort
$url = "http://127.0.0.1:$selectedPort/index.html"

Write-Host "Starting Brandream KOL Hub..."
Write-Host "URL: $url"

if (-not $NoBrowser) {
    Start-Job -ScriptBlock {
        param($TargetUrl)
        Start-Sleep -Seconds 2
        Start-Process $TargetUrl
    } -ArgumentList $url | Out-Null
}

if (Test-Path $bundledPython) {
    & $bundledPython $serverScript
    exit $LASTEXITCODE
}

if (Get-Command python -ErrorAction SilentlyContinue) {
    & python $serverScript
    exit $LASTEXITCODE
}

throw "Python not found. Please run this project inside Codex desktop or install Python."
