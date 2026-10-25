@echo off
title Punarnava Factory
cd /d "%~dp0"
echo Starting Punarnava... leave this window open while you work.
echo Close this window to stop the server.
rem Open the browser after the server has had a few seconds to start.
start "" /min cmd /c "timeout /t 8 /nobreak >nul & start http://localhost:3000/factory"
call npm run dev
pause
