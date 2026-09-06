@echo off
echo ========================================
echo   MANUAL CERTIFICATE SETUP
echo   (Requires Git for Windows or OpenSSL)
echo ========================================
echo.

echo Checking for OpenSSL...
echo.

where openssl >nul 2>nul
if errorlevel 1 (
  echo ❌ OpenSSL NOT found!
  echo.
  echo ========================================
  echo   SOLUTION: Install Git for Windows
  echo ========================================
  echo.
  echo 1. Go to: https://git-scm.com/download/win
  echo 2. Download: "64-bit Git for Windows Setup"
  echo 3. Install it (click Next through everything)
  echo 4. Restart this script
  echo.
  echo Git includes OpenSSL, so this is the easiest way!
  echo.
  echo Alternative: Download OpenSSL directly from:
  echo https://slproweb.com/products/Win32OpenSSL.html
  echo (Choose "Win64 OpenSSL v3.x.x Light")
  echo.
  pause
  exit /b 1
)

echo ✅ OpenSSL found!
echo.

if not exist certs mkdir certs

echo Enter your admin laptop IP address:
echo (Find it by running: ipconfig)
echo Example: 192.168.1.100
echo.
set /p IP=Your IP: 

if "%IP%"=="" (
  echo ❌ No IP entered!
  pause
  exit /b 1
)

echo.
echo Generating certificate for IP: %IP%
echo.

openssl req -x509 -newkey rsa:2048 -nodes -days 3650 -keyout certs\server-key.pem -out certs\server-cert.pem -subj "/CN=%IP%" -addext "subjectAltName=IP:%IP%"

if errorlevel 1 (
  echo.
  echo ❌ Certificate generation failed!
  pause
  exit /b 1
)

echo.
echo ========================================
echo   ✅ CERTIFICATE CREATED!
echo ========================================
echo.
echo Certificate files created in certs\ folder:
echo   - server-cert.pem
echo   - server-key.pem
echo.
echo Valid for 10 years!
echo IP address: %IP%
echo.
echo Next step:
echo   Run: start-background.bat
echo.
pause
