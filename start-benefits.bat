@echo off
cd /d "%~dp0benefits-app"
npm run dev -- -H 0.0.0.0
pause
