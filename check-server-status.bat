@echo off
echo ========================================
echo   SERVER STATUS CHECK
echo ========================================
echo.

REM Check if node.exe is running
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ Server is running
    echo.
    for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /NH') do (
        echo    Process ID: %%a
    )
    echo.
    echo 📊 View logs: view-logs.bat
    echo 🛑 Stop server: stop-server.bat
) else (
    echo ❌ Server is NOT running
    echo.
    echo 🚀 Start server: start-background.bat
)

echo.
pause
