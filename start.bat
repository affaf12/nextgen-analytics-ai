@echo off
title nextgen-analytics-ai Launcher
setlocal enabledelayedexpansion

echo ============================================
echo   nextgen-analytics-ai
echo   Starting backend + frontend...
echo ============================================
echo.

REM ---- Backend setup ----
cd /d "%~dp0backend"

if not exist "venv" (
    echo [Backend] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo.
        echo ERROR: Python not found. Install Python 3.10+ from python.org
        echo and make sure "Add python.exe to PATH" is checked during install.
        pause
        exit /b 1
    )
)

echo [Backend] Installing/checking dependencies...
call venv\Scripts\activate.bat
pip install -q -r requirements.txt

echo [Backend] Launching FastAPI on http://localhost:8000 ...
start "NextGen Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000"

REM ---- Frontend setup ----
cd /d "%~dp0frontend"

where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo ERROR: Node.js not found. Install it from https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [Frontend] Installing npm packages, this may take a minute...
    call npm install
)

echo [Frontend] Launching Vite dev server on http://localhost:5173 ...
start "NextGen Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ============================================
echo   Both servers are starting in separate windows.
echo   Once ready, open: http://localhost:5173
echo   Close those windows to stop the servers.
echo ============================================
timeout /t 5 >nul
start "" "http://localhost:5173"

endlocal
