@echo off
echo Starting FoodBridge Backend and Frontend...

start "FoodBridge Backend (FastAPI)" cmd /k "backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

start "FoodBridge Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   FoodBridge (HACK-P197) is launching!
echo   Frontend: http://localhost:5173
echo   Backend:  http://127.0.0.1:8000/docs
echo ========================================================
pause
