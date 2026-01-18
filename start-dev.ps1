# Check if Docker is running
Write-Host "🚀 Starting Basaeer Development Environment..."

$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running. Please start Docker first."
    exit 1
}

# Start the database container
Write-Host "📦 Starting PostgreSQL database..."
docker start basaeer_db

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..."
Start-Sleep -Seconds 3

# Check if database is accessible
# We rely on pg_isready inside the container
docker exec basaeer_db pg_isready -U basaeer | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database is ready!"
} else {
    Write-Host "⚠️  Database might still be starting up. Give it a few more seconds."
}

Write-Host ""
Write-Host "🎉 Development environment is ready!"
Write-Host ""
Write-Host "📝 Default admin credentials:"
Write-Host "   Email: superadmin@basaeer.com"
Write-Host "   Password: admin123"
Write-Host ""
Write-Host "To start the backend: cd backend; npm run start:dev"
Write-Host "To start the frontend: cd frontend; npm run dev"
