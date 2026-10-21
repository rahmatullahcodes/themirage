@echo off
title The Mirage - Creator Platform Server
echo ========================================================
echo        THE MIRAGE - PREMIER CREATOR PLATFORM
echo     "Real People. Exclusive Content. Your World."
echo ========================================================
echo.
echo [1/2] Compiling Tailwind CSS theme...
call npx tailwindcss -i src\app\globals.css -o public\output.css
echo.
echo [2/2] Starting Application Server on http://localhost:3000 ...
echo.
node server.js
pause
