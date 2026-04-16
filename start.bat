@echo off
set "APP_DIR=%~dp0"
start "Backend" cmd /k "cd /d ""%APP_DIR%"" && node server.js"
start "Frontend" cmd /k "cd /d ""%APP_DIR%frontend"" && npm run dev"
echo Servers started!
pause