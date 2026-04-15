@echo off
title StudyTree Backend
cd C:\data\studytree-app
start "Backend" cmd /k "node server.js"
timeout /t 3 /nobreak > nul
title StudyTree Frontend
cd C:\data\studytree-app\frontend
start "Frontend" cmd /k "npm run dev"
echo Servers started!
pause