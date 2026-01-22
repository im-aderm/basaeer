# Basaeer Development Environment Check
Write-Host "🚀 Checking Basaeer Development Environment (Local Mode)..." -ForegroundColor Cyan

# Check if local Postgres is running on 5432
Write-Host "🔍 Checking for local PostgreSQL on port 5432..."
$pgCheck = Test-NetConnection -ComputerName localhost -Port 5432 -InformationLevel Quiet
if ($pgCheck) {
    Write-Host "✅ Local PostgreSQL is reachable!" -ForegroundColor Green
}
else {
    Write-Host "❌ Local PostgreSQL on port 5432 failed." -ForegroundColor Red
    Write-Host "👉 Please ensure your local PostgreSQL service is started."
}

# Check for .env file
if (Test-Path "backend\.env") {
    Write-Host "✅ backend\.env file found." -ForegroundColor Green
}
else {
    Write-Host "⚠️  backend\.env file missing!" -ForegroundColor Yellow
    Write-Host "👉 Create it by copying .env.example if available, and update DATABASE_URL."
}

Write-Host ""
Write-Host "🎉 Ready to start!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Default admin credentials (if database is seeded):"
Write-Host "   Email: superadmin@basaeer.com"
Write-Host "   Password: admin123"
Write-Host ""
Write-Host "To start the backend:"
Write-Host "   cd backend"
Write-Host "   npx prisma migrate dev"
Write-Host "   npm run start:dev"
Write-Host ""
Write-Host "To start the frontend:"
Write-Host "   cd frontend"
Write-Host "   npm run dev"
Write-Host ""
