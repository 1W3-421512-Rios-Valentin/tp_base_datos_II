@echo off
echo ==== StudyTree - Actualizar y ejecutar ====
echo.
echo 1. Pull cambios...
cd C:\data\studytree-app
git pull origin main
echo.
echo 2. Arrancar Backend...
start "Backend" cmd /k "cd C:\data\studytree-app && node server.js"
echo.
echo 3. Arrancar Frontend...
start "Frontend" cmd /k "cd C:\data\studytree-app\frontend && npm run dev"
echo.
echo Listo! Abre http://localhost:3000
pause