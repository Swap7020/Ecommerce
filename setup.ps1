#!/usr/bin/env pwsh
# AURA Cosmetics — Quick setup script for Windows
# Run: .\setup.ps1

Write-Host ""
Write-Host "🌸  AURA Cosmetics — Project Setup" -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Magenta
Write-Host ""

# 1. Copy env file if not exists
if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✅  Created backend/.env (edit it with your values)" -ForegroundColor Green
} else {
    Write-Host "ℹ️   backend/.env already exists" -ForegroundColor Cyan
}

if (-not (Test-Path "frontend\.env.local")) {
    Copy-Item "frontend\.env.example" "frontend\.env.local"
    Write-Host "✅  Created frontend/.env.local" -ForegroundColor Green
} else {
    Write-Host "ℹ️   frontend/.env.local already exists" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Choose setup method:" -ForegroundColor Yellow
Write-Host "  1) Docker (recommended — runs everything automatically)"
Write-Host "  2) Manual (requires Python + Node + PostgreSQL + Redis installed)"
Write-Host ""
$choice = Read-Host "Enter 1 or 2"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "🐳  Starting with Docker..." -ForegroundColor Blue
    docker compose up --build -d
    Start-Sleep -Seconds 10
    Write-Host "Running migrations..." -ForegroundColor Blue
    docker compose exec backend python manage.py migrate
    Write-Host "Seeding demo data..." -ForegroundColor Blue
    docker compose exec backend python manage.py seed_data
    Write-Host ""
    Write-Host "✅  Setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Frontend:    http://localhost" -ForegroundColor Cyan
    Write-Host "   Backend API: http://localhost:8000/api" -ForegroundColor Cyan
    Write-Host "   API Docs:    http://localhost:8000/api/docs" -ForegroundColor Cyan
    Write-Host "   Admin:       http://localhost:8000/admin" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Run 'docker compose exec backend python manage.py createsuperuser' to create an admin account." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "📋  Manual Setup Steps:" -ForegroundColor Blue
    Write-Host ""
    Write-Host "1. Edit backend/.env with your PostgreSQL and Redis credentials"
    Write-Host "2. Create a PostgreSQL database named 'aura_cosmetics'"
    Write-Host "3. Backend:"
    Write-Host "   cd backend"
    Write-Host "   python -m venv venv"
    Write-Host "   .\venv\Scripts\Activate.ps1"
    Write-Host "   pip install -r requirements.txt"
    Write-Host "   python manage.py migrate"
    Write-Host "   python manage.py createsuperuser"
    Write-Host "   python manage.py seed_data"
    Write-Host "   python manage.py runserver"
    Write-Host ""
    Write-Host "4. Frontend (new terminal):"
    Write-Host "   cd frontend"
    Write-Host "   npm install"
    Write-Host "   npm run dev"
    Write-Host ""
    Write-Host "   Frontend: http://localhost:5173"
    Write-Host "   Backend:  http://localhost:8000"
}
