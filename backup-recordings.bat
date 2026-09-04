@echo off
echo ========================================
echo   DAILY BACKUP - Academy Recordings
echo ========================================
echo.

REM Source: External HDD with recordings
set SOURCE=E:\AcademyRecordings

REM Backup destination (change to your backup drive)
set BACKUP_DRIVE=F:\Backup

REM Create dated backup folder
set BACKUP_FOLDER=%BACKUP_DRIVE%\Academy_%DATE:~-4,4%-%DATE:~-10,2%-%DATE:~-7,2%

echo Source: %SOURCE%
echo Backup: %BACKUP_FOLDER%
echo.

REM Check if source exists
if not exist %SOURCE% (
  echo ❌ ERROR: Source folder not found!
  echo Please check if external HDD is connected.
  pause
  exit /b 1
)

REM Check if backup drive exists
if not exist %BACKUP_DRIVE%\ (
  echo ❌ ERROR: Backup drive not found!
  echo Please connect backup drive (F:\) and try again.
  pause
  exit /b 1
)

echo Starting backup...
echo.

REM Create backup root folder
if not exist %BACKUP_DRIVE% mkdir %BACKUP_DRIVE%

REM Create dated backup folder
if not exist %BACKUP_FOLDER% mkdir %BACKUP_FOLDER%

REM Copy all files (only new/modified files)
xcopy %SOURCE% %BACKUP_FOLDER% /E /I /Y /D

echo.
echo ✅ Backup completed successfully!
echo.
echo Backup location: %BACKUP_FOLDER%
echo.

REM Count backed up files
dir %BACKUP_FOLDER%\*.webm /s /b | find /c /v "" > temp_count.txt
set /p FILE_COUNT=<temp_count.txt
del temp_count.txt

echo Total recordings backed up: %FILE_COUNT% files
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   BACKUP SUMMARY
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   Date: %DATE% %TIME%
echo   Files: %FILE_COUNT%
echo   Location: %BACKUP_FOLDER%
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
