@echo off
echo ========================================
echo   ACADEMY RECORDER SERVER
echo   Starting in BACKGROUND mode...
echo ========================================

cd /d %~dp0

REM Configure storage and port
set STORAGE_ROOT=D:\AdminRecordings
set PORT=3443

echo.
echo Configuration:
echo ===============
echo Storage: %STORAGE_ROOT%
echo Port: %PORT%
echo.

REM Check if storage path exists
if not exist "%STORAGE_ROOT%\.." (
  echo.
  echo ❌ ERROR: Storage drive not accessible!
  echo.
  echo Please check:
  echo 1. External drive is connected
  echo 2. Drive letter is correct in this script
  echo 3. You have write permissions
  echo.
  pause
  goto :eof
)

REM Create storage folder if it doesn't exist
if not exist "%STORAGE_ROOT%" (
  echo Creating storage folder...
  mkdir "%STORAGE_ROOT%"
)

echo ✅ External drive connected
echo.

REM Install dependencies if needed
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  echo.
)

echo Starting server in BACKGROUND with logging...
echo.

REM Start server in background with logs
powershell -Command "Start-Process -WindowStyle Hidden -FilePath 'node' -ArgumentList 'server.js' -RedirectStandardOutput 'server.log' -RedirectStandardError 'error.log'"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   ✅ SERVER STARTED IN BACKGROUND!
echo ========================================
echo.
echo 📡 Server is running at:
echo    https://YOUR-IP-ADDRESS:%PORT%
echo.
echo 📊 Admin Dashboard:
echo    https://YOUR-IP-ADDRESS:%PORT%/admin.html
echo.
echo 💡 Find your IP: ipconfig
echo.
echo ✅ You can now close this window!
echo    Server will keep running in background.
echo.
echo To stop server:
echo    Run: stop-server.bat
echo.
echo To check if running:
echo    Run: check-server-status.bat
echo.
pause
