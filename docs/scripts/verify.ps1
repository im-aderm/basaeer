# Kill any existing process on port 3000
try {
    $portProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($portProcess) {
        $procId = $portProcess.OwningProcess
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
} catch {
    # Ignore errors if no process found or permission denied (though standard user owns their node process usually)
}

# Start backend in background
# We use Start-Process to separate it.
Write-Host "Starting backend in background..."  
$backendProcess = Start-Process -FilePath "npm" -ArgumentList "run start" -PassThru -NoNewWindow -RedirectStandardOutput "backend.log" -RedirectStandardError "backend.log"

Write-Host "Server started with PID $($backendProcess.Id). Waiting for it to be ready..."
Start-Sleep -Seconds 15

# Bootstrap
Write-Host "Running Bootstrap..."
try {
    Invoke-RestMethod -Uri "http://localhost:3000/auth/bootstrap" -Method Post | Out-Null
} catch {
    Write-Host "Bootstrap might have failed or already done: $_"
}

Write-Host ""

# Login
Write-Host "Logging in..."
try {
    $loginBody = @{
        email = "superadmin@basaer.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $loginRes = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    Write-Host "Login Response received."
    
    $token = $loginRes.access_token
    
    if (-not $token) {
        Write-Host "Failed to get token"
        Stop-Process -Id $backendProcess.Id -Force
        exit 1
    }
    
    Write-Host "Token received."
} catch {
    Write-Host "Login failed: $_"
    Stop-Process -Id $backendProcess.Id -Force
    exit 1
}

# Create Branch
Write-Host "Creating Branch..."
$ts = Get-Date -UFormat %s
$branchBody = @{
    name = "Main Branch $ts"
    code = "B$ts"
} | ConvertTo-Json

try {
    $branchRes = Invoke-RestMethod -Uri "http://localhost:3000/branches" -Method Post -Body $branchBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
    
    Write-Host "Branch Response received."
    $branchId = $branchRes.id
    
    if (-not $branchId) {
        Write-Host "Failed to get Branch ID"
        Stop-Process -Id $backendProcess.Id -Force
        exit 1
    }
    
    Write-Host "Branch ID: $branchId"
    
    # Create Teacher
    Write-Host "Creating Teacher..."
    $teacherBody = @{
        email = "teacher$($ts)@basaer.com"
        password = "teach123"
        firstName = "John"
        lastName = "Doe"
        branchId = $branchId
        designation = "Senior Teacher"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:3000/employees/teachers" -Method Post -Body $teacherBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" } | Out-Null
    
    Write-Host "Teacher created."
    Write-Host ""
    
    # Create Student
    Write-Host "Creating Student..."
    $studentBody = @{
        email = "student$($ts)@basaer.com"
        password = "stud123"
        firstName = "Alice"
        lastName = "Smith"
        branchId = $branchId
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:3000/students" -Method Post -Body $studentBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" } | Out-Null
    
    Write-Host "Student created."
    Write-Host ""
    
    Write-Host "Verification Complete."

} catch {
    Write-Host "Error during verification steps: $_"
} finally {
    # Cleanup
    if ($backendProcess) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    # Double check port 3000
    try {
        $p = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
        if ($p) { Stop-Process -Id $p.OwningProcess -Force -ErrorAction SilentlyContinue }
    } catch {}
}
