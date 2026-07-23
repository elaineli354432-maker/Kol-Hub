@echo off
setlocal

cd /d "%~dp0\.."

echo Preparing local commit...
git add deploy/supabase.sql

git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Harden Supabase deployment SQL"
) else (
  echo No new local changes to commit.
)

echo.
echo Pushing to GitHub with --force...
echo This only replaces the temporary remote test commit that was created during deployment setup.
set HTTP_PROXY=
set HTTPS_PROXY=
set ALL_PROXY=
set GIT_HTTP_PROXY=
set GIT_HTTPS_PROXY=
set http_proxy=
set https_proxy=
set all_proxy=
git -c http.version=HTTP/1.1 -c http.sslBackend=openssl push --force origin main

echo.
if errorlevel 1 (
  echo Push failed. If GitHub asks you to sign in, complete the sign-in and run this file again.
) else (
  echo Push completed successfully.
)

pause
