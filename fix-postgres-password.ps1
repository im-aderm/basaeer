# Fix PostgreSQL Password Script
# This script will help you reset the postgres user password to match your .env configuration

Write-Host "PostgreSQL Password Configuration Helper" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# Check if PostgreSQL service is running
$pgService = Get-Service -Name "postgresql-x64-18" -ErrorAction SilentlyContinue
if ($pgService.Status -ne "Running") {
    Write-Host "ERROR: PostgreSQL service is not running!" -ForegroundColor Red  
    Write-Host "Please start the postgresql-x64-18 service first." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ PostgreSQL service is running" -ForegroundColor Green

# Paths
$pgBinPath = "C:\Program Files\PostgreSQL\18\bin"
$psqlExe = Join-Path $pgBinPath "psql.exe"

if (-not (Test-Path $psqlExe)) {
    Write-Host "ERROR: psql.exe not found at: $psqlExe" -ForegroundColor Red
    Write-Host "Please update the script with the correct PostgreSQL bin path." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Found psql.exe at: $psqlExe" -ForegroundColor Green

Write-Host "`nOptions to fix the database connection:" -ForegroundColor Yellow
Write-Host "1. Reset the postgres user password to 'postgrespassword'" -ForegroundColor White
Write-Host "2. Update the .env file with your current postgres password" -ForegroundColor White
Write-Host "3. Cancel and manually configure" -ForegroundColor White

$choice = Read-Host "`nEnter your choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        Write-Host "`n" -NoNewline
        Write-Host "Resetting postgres password..." -ForegroundColor Cyan
        Write-Host "You will need to enter your CURRENT postgres password when prompted." -ForegroundColor Yellow
        Write-Host "`nPress any key to continue..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        
        # Use psql to change password
        $query = "ALTER USER postgres WITH PASSWORD 'postgrespassword';"
        & $psqlExe -U postgres -d postgres -c $query
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✓ Password successfully reset to 'postgrespassword'" -ForegroundColor Green
            Write-Host "You can now start the backend server." -ForegroundColor Green
        } else {
            Write-Host "`n✗ Failed to reset password." -ForegroundColor Red
            Write-Host "Please try option 2 to update the .env file instead." -ForegroundColor Yellow
        }
    }
    "2" {
        Write-Host "`n" -NoNewline
        $currentPassword = Read-Host "Enter your current PostgreSQL postgres user password" -AsSecureString
        $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($currentPassword)
        )
        
        # Update .env file
        $envPath = ".\backend\.env"
        if (Test-Path $envPath) {
            $envContent = Get-Content $envPath -Raw
            $newDbUrl = "DATABASE_URL=`"postgresql://postgres:$plainPassword@localhost:5432/basaeer?schema=public`""
            $envContent = $envContent -replace 'DATABASE_URL="postgresql://postgres:[^@]+@localhost:5432/basaeer\?schema=public"', $newDbUrl
            Set-Content -Path $envPath -Value $envContent
            
            Write-Host "✓ .env file updated successfully" -ForegroundColor Green
            Write-Host "Please restart the backend server if it's running." -ForegroundColor Yellow
        } else {
            Write-Host "✗ .env file not found at: $envPath" -ForegroundColor Red
        }
    }
    "3" {
        Write-Host "`nCancelled. You can manually:" -ForegroundColor Yellow
        Write-Host "- Update backend\.env with your PostgreSQL password" -ForegroundColor White
        Write-Host "- Or reset PostgreSQL password to match .env" -ForegroundColor White
        exit 0
    }
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nNext steps:" -ForegroundColor Cyan  
Write-Host "1. cd backend" -ForegroundColor White
Write-Host "2. npm run start:dev" -ForegroundColor White
Write-Host "3. Test bootstrap endpoint: Invoke-RestMethod -Uri 'http://localhost:3001/auth/bootstrap' -Method POST" -ForegroundColor White
