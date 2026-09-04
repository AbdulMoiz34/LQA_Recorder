@echo off
echo ========================================
echo   ACADEMY RECORDING SYSTEM
echo   Opening Recording Interface...
echo ========================================
echo.

REM ⚠️ IMPORTANT: Change this to your admin laptop's IP address!
set ADMIN_IP=192.168.1.100
set PORT=3443

echo Connecting to server: https://%ADMIN_IP%:%PORT%
echo.

REM Open Chrome with the recording interface
start chrome --new-window "https://%ADMIN_IP%:%PORT%"

echo.
echo ✅ Recording system opened in Chrome
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   INSTRUCTIONS FOR TEACHERS
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 1. Enter your teacher ID (e.g., teacher-01)
echo.
echo 2. Keep "Record microphone" checked
echo.
echo 3. Click "Start Recording"
echo.
echo 4. Select your screen or teaching app window
echo.
echo 5. Click "Share"
echo.
echo 6. ⚠️  IMPORTANT: Keep Chrome tab OPEN all day!
echo    - You can minimize Chrome
echo    - You can use other programs
echo    - Just don't close the Chrome tab
echo.
echo 7. At end of day:
echo    - Open Chrome
echo    - Go to recording tab
echo    - Click "Stop Recording"
echo    - Wait for uploads to finish
echo    - Then you can close Chrome
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
