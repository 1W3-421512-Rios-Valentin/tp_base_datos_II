@echo off
cd C:\data\studytree-app
start "Backend" cmd /k "node server.js"
cd C:\data\studytree-app\frontend
start "Frontend" cmd /k "npm run dev"
echo Servers started!
pause