@echo off
set PATH=C:\Program Files\nodejs;%PATH%
call npm install --no-fund --no-audit
if %ERRORLEVEL% NEQ 0 (
  echo npm install failed
  exit /b %ERRORLEVEL%
)
call npm run dev
