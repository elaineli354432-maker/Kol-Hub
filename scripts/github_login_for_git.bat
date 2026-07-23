@echo off
setlocal

set HTTP_PROXY=
set HTTPS_PROXY=
set ALL_PROXY=
set GIT_HTTP_PROXY=
set GIT_HTTPS_PROXY=
set http_proxy=
set https_proxy=
set all_proxy=

echo Opening Git Credential Manager login for GitHub...
"C:\Program Files\Git\mingw64\bin\git-credential-manager.exe" github login

echo.
if errorlevel 1 (
  echo Login was not completed successfully.
) else (
  echo GitHub login completed. You can now run push_repo_to_github_force.bat again.
)

pause
