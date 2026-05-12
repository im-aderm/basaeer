# Kill any existing process on port 3000
try {
    $portProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($portProcess) {
        Stop-Process -Id $portProcess.OwningProcess -Force -ErrorAction SilentlyContinue
    }
} catch {}

$TS = Get-Date -UFormat %s
# Remove decimal if present (Windows Get-Date -UFormat %s might return float)
$TS = [Math]::Floor($TS)

# Start backend
Write-Host "Starting backend in background..."
$backendProcess = Start-Process -FilePath "npm" -ArgumentList "run start" -PassThru -NoNewWindow -RedirectStandardOutput "backend_p1.log" -RedirectStandardError "backend_p1.log"

Write-Host "Server started with PID $($backendProcess.Id). Waiting for it to be ready..."
Start-Sleep -Seconds 15

try {
    # Bootstrap & Login
    Write-Host "--- Bootstrapping ---"
    try { Invoke-RestMethod -Uri "http://localhost:3000/auth/bootstrap" -Method Post | Out-Null } catch {}

    Write-Host "`nLogging in as Super Admin..."
    $loginBody = @{ email="superadmin@basaer.com"; password="admin123" } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginRes.access_token

    if (-not $token) {
        Write-Host "CRITICAL: Failed to get Super Admin token."
        throw "Login failed"
    }
    Write-Host "Super Admin Token Received."

    # 1. Test Permissions Seeding
    Write-Host "--- Testing Permissions Seeding ---"
    $seedRes = Invoke-RestMethod -Uri "http://localhost:3000/permissions/seed" -Method Post -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Seed Response: $($seedRes | ConvertTo-Json -Depth 1)"

    # 2. Test Academic Sessions CRUD
    Write-Host "--- Testing Academic Sessions ---"
    $sessionBody = @{
        name = "Session $TS"
        startDate = "2025-09-01T00:00:00Z"
        endDate = "2026-07-31T00:00:00Z"
        isActive = $true
    } | ConvertTo-Json
    $sessionRes = Invoke-RestMethod -Uri "http://localhost:3000/sessions" -Method Post -Body $sessionBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Create Session Response: $($sessionRes | ConvertTo-Json -Depth 1)"

    # 3. Test Branch Isolation
    Write-Host "--- Testing Branch Isolation ---"
    
    # Branch 1
    $b1Body = @{ name = "Campus Alpha $TS"; code = "A$TS" } | ConvertTo-Json
    $b1Res = Invoke-RestMethod -Uri "http://localhost:3000/branches" -Method Post -Body $b1Body -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
    $b1Id = $b1Res.id
    if (-not $b1Id) { throw "ERROR: Failed to create Campus Alpha" }
    Write-Host "Campus Alpha ID: $b1Id"

    # Branch 2
    $b2Body = @{ name = "Campus Beta $TS"; code = "B$TS" } | ConvertTo-Json
    $b2Res = Invoke-RestMethod -Uri "http://localhost:3000/branches" -Method Post -Body $b2Body -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
    $b2Id = $b2Res.id
    if (-not $b2Id) { throw "ERROR: Failed to create Campus Beta" }
    Write-Host "Campus Beta ID: $b2Id"

    # Create Branch Admin for Alpha
    Write-Host "Creating Branch Admin for Alpha..."
    $adminAlphaBody = @{
        email = "admin.alpha.$TS@basaer.com"
        password = "alpha123"
        firstName = "Alpha"
        lastName = "Admin"
        role = "BRANCH_ADMIN"
        branchId = $b1Id
    } | ConvertTo-Json
    $adminAlphaRes = Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -Body $adminAlphaBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Admin Alpha Register Response ID: $($adminAlphaRes.id)"

    # Login as Alpha Admin
    Write-Host "Logging in as Alpha Admin..."
    $alphaLoginBody = @{ email = "admin.alpha.$TS@basaer.com"; password = "alpha123" } | ConvertTo-Json
    $alphaLogin = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $alphaLoginBody -ContentType "application/json"
    $alphaToken = $alphaLogin.access_token

    if (-not $alphaToken) {
        Write-Host "ERROR: Failed to get Alpha Admin token."
    } else {
        Write-Host "Alpha Admin Token Received."
        
        # Access Campus Beta (Forbidden)
        Write-Host "Requesting Campus Beta ($b2Id) as Alpha Admin (Expected: 403 Forbidden)..."
        try {
            $betaAccess = Invoke-RestMethod -Uri "http://localhost:3000/branches/$b2Id" -Method Get -Headers @{ Authorization = "Bearer $alphaToken" }
            Write-Host "UNEXPECTED: Accessed Beta Branch! Response: $betaAccess"
        } catch {
            Write-Host "Success: Caught expected error: $($_.Exception.Message)"
        }

        # Access Campus Alpha (OK)
        Write-Host "Requesting Campus Alpha ($b1Id) as Alpha Admin (Expected: 200 OK)..."
        try {
            $alphaAccess = Invoke-RestMethod -Uri "http://localhost:3000/branches/$b1Id" -Method Get -Headers @{ Authorization = "Bearer $alphaToken" }
            Write-Host "Alpha Access Response ID: $($alphaAccess.id)"
        } catch {
            Write-Host "ERROR: Failed to access own branch: $($_.Exception.Message)"
        }
    }

    Write-Host "Verification Complete."

} catch {
    Write-Host "An error occurred: $_"
} finally {
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    # Cleanup port 3000
    try {
        $p = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
        if ($p) { Stop-Process -Id $p.OwningProcess -Force -ErrorAction SilentlyContinue }
    } catch {}
}
