@echo off
echo ========================================
echo   ACADEMY RECORDING SERVER
echo   Admin Laptop - Starting...
echo ========================================

cd /d %~dp0

REM Configure external HDD storage
REM CHANGE THIS to your external drive letter and folder
set STORAGE_ROOT=E:\AcademyRecordings

REM CHANGE THIS password for security!
set UPLOAD_PASSWORD=academy2024

REM Server port
set PORT=3443

echo.
echo Configuration:
echo ===============
echo Storage: %STORAGE_ROOT%
echo Password: %UPLOAD_PASSWORD%
echo Port: %PORT%
echo.

REM Check if external drive exists
if not exist E:\ (
  echo.
  echo ❌ ERROR: External HDD (E:\) not connected!
  echo.
  echo Please connect the 1TB external hard disk to continue.
  echo After connecting, press any key to retry...
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

echo Starting server...
echo.
echo 📡 Server will be accessible at:
echo    https://YOUR-IP-ADDRESS:3443
echo.
echo 📊 Admin Dashboard:
echo    https://YOUR-IP-ADDRESS:3443/admin.html
echo.
echo 💡 Find your IP: ipconfig
echo.
echo ⚠️  Keep this window OPEN while server is running!
echo.

npm start

pause
