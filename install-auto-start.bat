@echo off
echo ========================================
echo   Installing Auto-Start Service
echo   Academy Recording Server
echo ========================================
echo.

set SCRIPT_PATH=%~dp0start-admin-server.bat

echo This will configure the server to start automatically
echo when the admin logs into Windows.
echo.
echo Script location: %SCRIPT_PATH%
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

echo.
echo Creating scheduled task...

schtasks /create /tn "AcademyRecordingServer" /tr "%SCRIPT_PATH%" /sc onlogon /rl highest /f

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ✅ Auto-start installed successfully!
  echo.
  echo The server will now start automatically when
  echo the admin user logs into Windows.
  echo.
  echo To disable auto-start:
  echo   1. Open Task Scheduler
  echo   2. Find "AcademyRecordingServer"
  echo   3. Right-click → Disable or Delete
  echo.
) else (
  echo.
  echo ❌ Failed to install auto-start.
  echo Please run this script as Administrator.
  echo.
  echo Right-click this file → Run as administrator
  echo.
)

pause
