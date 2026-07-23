$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "Preparing local commit..." -ForegroundColor Cyan
git add deploy/supabase.sql

git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  git commit -m "Harden Supabase deployment SQL"
} else {
  Write-Host "No new local changes to commit." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Pushing to GitHub with --force..." -ForegroundColor Cyan
Write-Host "This only replaces the temporary remote test commit that was created during deployment setup." -ForegroundColor DarkYellow
$env:HTTP_PROXY = $null
$env:HTTPS_PROXY = $null
$env:ALL_PROXY = $null
$env:GIT_HTTP_PROXY = $null
$env:GIT_HTTPS_PROXY = $null
$env:http_proxy = $null
$env:https_proxy = $null
$env:all_proxy = $null
git -c http.version=HTTP/1.1 -c http.sslBackend=openssl push --force origin main

Write-Host ""
if ($LASTEXITCODE -ne 0) {
  Write-Host "Push failed. If GitHub asks you to sign in, complete the sign-in and run this script again." -ForegroundColor Red
} else {
  Write-Host "Push completed successfully." -ForegroundColor Green
}
