@echo off
cd /d "%~dp0frontend"
npm run dev -- -H 0.0.0.0
pause
