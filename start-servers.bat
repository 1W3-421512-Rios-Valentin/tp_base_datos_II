@echo off
title StudyTree Backend
set "APP_DIR=%~dp0"
start "Backend" cmd /k "cd /d ""%APP_DIR%"" && node server.js"
timeout /t 3 /nobreak > nul
title StudyTree Frontend
start "Frontend" cmd /k "cd /d ""%APP_DIR%frontend"" && npm run dev"
echo Servers started!
pause