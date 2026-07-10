@echo off
setlocal

powershell.exe -ExecutionPolicy Bypass -File "%~dp0run_kol_hub.ps1"

:end
echo.
echo Press any key to close this window...
pause >nul
