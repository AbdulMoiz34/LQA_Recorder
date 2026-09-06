@echo off
echo ========================================
echo   SERVER STATUS CHECK
echo ========================================
echo.

REM Check if Node.js process is running
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL

if "%ERRORLEVEL%"=="0" (
    echo ✅ Server is RUNNING
    echo.
    echo Active Node.js processes:
    tasklist /FI "IMAGENAME eq node.exe"
    echo.
    echo Server should be accessible at:
    echo    https://localhost:3443
    echo    https://[YOUR-IP]:3443
    echo.
) else (
    echo ❌ Server is NOT running
    echo.
    echo To start server manually:
    echo    Run: start-admin-server.bat
    echo.
    echo To enable auto-start:
    echo    Run: install-autostart.bat (as Administrator)
    echo.
)

echo ========================================
echo   AUTO-START STATUS
echo ========================================
echo.

REM Check if scheduled task exists
schtasks /query /tn "AcademyRecorderServer" >NUL 2>&1

if "%ERRORLEVEL%"=="0" (
    echo ✅ Auto-start is ENABLED
    echo.
    echo Task details:
    schtasks /query /tn "AcademyRecorderServer" /fo LIST /v
) else (
    echo ❌ Auto-start is NOT enabled
    echo.
    echo To enable:
    echo    Run: install-autostart.bat (as Administrator)
    echo.
)

pause
