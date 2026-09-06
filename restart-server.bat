@echo off
echo ========================================
echo   RESTART ACADEMY RECORDER SERVER
echo ========================================
echo.

echo Stopping existing server...
call stop-server.bat

echo.
echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo.
echo Starting server in background...
call start-background.bat

echo.
echo ========================================
echo   ✅ SERVER RESTARTED!
echo ========================================
echo.
