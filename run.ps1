Write-Host "Starting FoodBridge Backend (FastAPI)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "Starting FoodBridge Frontend (Vite)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "  FoodBridge (HACK-P197) Started Successfully!" -ForegroundColor Yellow
Write-Host "  Frontend App: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend API:  http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Yellow
