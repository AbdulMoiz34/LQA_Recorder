@echo off
where openssl >nul 2>nul
if errorlevel 1 (
  echo OpenSSL is required. Install Git for Windows, then run this file from Git Bash or add OpenSSL to PATH.
  pause
  exit /b 1
)
if not exist certs mkdir certs
set /p IP=172.22.176.1: 
openssl req -x509 -newkey rsa:2048 -nodes -days 3650 -keyout certs\server-key.pem -out certs\server-cert.pem -subj "/CN=%IP%" -addext "subjectAltName=IP:%IP%"
echo Certificate created.
pause
