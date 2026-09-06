@echo off
echo ========================================
echo   INSTALL AUTO-START
echo   Server will start on Windows boot
echo ========================================
echo.

REM Get current directory
set "PROJECT_DIR=%~dp0"

echo Creating auto-start task...
echo.

REM Create Task Scheduler task to run at startup (in background)
schtasks /create /tn "AcademyRecorderServer" /tr "\"%PROJECT_DIR%start-background.bat\"" /sc onlogon /rl highest /f

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   ✅ AUTO-START INSTALLED!
    echo ========================================
    echo.
    echo Server will now start automatically when:
    echo   - Windows boots up
    echo   - User logs in
    echo.
    echo To verify:
    echo   1. Restart your laptop
    echo   2. Server should start automatically
    echo   3. Check: https://localhost:3443
    echo.
    echo To uninstall auto-start:
    echo   Run: uninstall-autostart.bat
    echo.
) else (
    echo.
    echo ❌ Installation failed!
    echo.
    echo Please run this script as Administrator:
    echo   1. Right-click install-autostart.bat
    echo   2. Click "Run as administrator"
    echo.
)

pause
