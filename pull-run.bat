@echo off
echo ==== StudyTree - Actualizar y ejecutar ====
echo.
echo 1. Pull cambios...
set "APP_DIR=%~dp0"
cd /d "%APP_DIR%"
git pull origin main
echo.
echo 2. Arrancar Backend...
start "Backend" cmd /k "cd /d ""%APP_DIR%"" && node server.js"
echo.
echo 3. Arrancar Frontend...
start "Frontend" cmd /k "cd /d ""%APP_DIR%frontend"" && npm run dev"
echo.
echo Listo! Abre http://localhost:3000
pause