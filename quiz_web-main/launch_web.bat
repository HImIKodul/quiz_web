@echo off
set "APP_DIR=C:\quiz_app"
set "LOG_FILE=%APP_DIR%\server_runtime.log"

echo [%date% %time%] Stopping existing web processes...
taskkill /IM python.exe /F 2>nul
timeout /t 2 /nobreak >nul

echo [%date% %time%] Running database migrations...
cd /d "%APP_DIR%"
"%APP_DIR%\.venv\Scripts\python.exe" migrate.py >> "%LOG_FILE%" 2>&1

echo [%date% %time%] Starting QuizApp Server on port 80...
"%APP_DIR%\.venv\Scripts\python.exe" "%APP_DIR%\.venv\Scripts\waitress-serve.exe" --port=80 app:app >> "%LOG_FILE%" 2>&1
