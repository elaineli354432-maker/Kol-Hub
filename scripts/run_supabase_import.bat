@echo off
setlocal

powershell.exe -ExecutionPolicy Bypass -File "%~dp0run_supabase_import.ps1"

echo.
echo Press any key to close this window...
pause >nul
