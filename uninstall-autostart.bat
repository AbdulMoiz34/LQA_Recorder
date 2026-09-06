@echo off
echo ========================================
echo   UNINSTALL AUTO-START
echo   Removing automatic startup
echo ========================================
echo.

echo Removing auto-start task...
echo.

REM Delete Task Scheduler task
schtasks /delete /tn "AcademyRecorderServer" /f

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   ✅ AUTO-START REMOVED!
    echo ========================================
    echo.
    echo Server will no longer start automatically.
    echo You must run start-admin-server.bat manually.
    echo.
) else (
    echo.
    echo ❌ Task not found or already removed.
    echo.
)

pause
