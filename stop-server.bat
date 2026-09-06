@echo off
echo ========================================
echo   STOP ACADEMY RECORDER SERVER
echo ========================================
echo.

echo Stopping all Node.js processes...
echo.

REM Kill all Node.js processes
taskkill /F /IM node.exe >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ Server stopped successfully!
    echo.
    echo All Node.js processes have been terminated.
) else (
    echo ℹ️ No server was running.
    echo.
    echo Node.js processes not found.
)

echo.
echo To start server again:
echo    Run: start-background.bat
echo.
pause
