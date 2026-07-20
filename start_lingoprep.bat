@echo off
title LingoPrep Launcher
echo ==========================================
echo Starting LingoPrep App...
echo ==========================================

:: Start Backend
echo Starting Backend (FastAPI)...
start "LingoPrep Backend (FastAPI)" cmd /k "cd /d lingoprep-backend && .\venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"

:: Wait 2 seconds
timeout /t 2 /nobreak >nul

:: Start Frontend
echo Starting Frontend (Next.js)...
start "LingoPrep Frontend (Next.js)" cmd /k "cd /d lingoprep-frontend && npm run dev"

echo ==========================================
echo Running!
echo API Docs:  http://localhost:8000/docs
echo Frontend:  http://localhost:3000
echo ==========================================
pause
