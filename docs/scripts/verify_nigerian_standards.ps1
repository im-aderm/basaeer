$apiUrl = "http://localhost:3000"

Write-Host "--- BMSMS Nigerian Standards Verification ---"

# 1. Authenticate
Write-Host "Authenticating Super Admin..."
try {
    $loginBody = @{ email = "superadmin@basaeer.com"; password = "admin123" } | ConvertTo-Json
    $loginResp = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResp.access_token

    if (-not $token) {
        Write-Host "Auth failed!"
        exit 1
    }
}
catch {
    Write-Host "Auth error: $_"
    exit 1
}

try {
    # 2. Ensure Test Data
    $branches = Invoke-RestMethod -Uri "$apiUrl/branches" -Method Get -Headers @{ Authorization = "Bearer $token" }
    $branchId = $branches[0].id

    $sessions = Invoke-RestMethod -Uri "$apiUrl/exams/sessions" -Method Get -Headers @{ Authorization = "Bearer $token" }
    $sessionId = $sessions[0].id

    if (-not $sessionId) {
        Write-Host "Creating test session..."
        $sessionBody = @{
            name      = "2024/2025 Test Session"
            startDate = "2024-09-01T00:00:00.000Z"
            endDate   = "2025-07-31T00:00:00.000Z"
        } | ConvertTo-Json
        $sessionResp = Invoke-RestMethod -Uri "$apiUrl/exams/sessions" -Method Post -Body $sessionBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
        $sessionId = $sessionResp.id
    }

    $classes = Invoke-RestMethod -Uri "$apiUrl/classes?branchId=$branchId" -Method Get -Headers @{ Authorization = "Bearer $token" }
    $classId = $classes[0].id
    $sectionId = $classes[0].sections[0].id
    
    $subjects = Invoke-RestMethod -Uri "$apiUrl/subjects" -Method Get -Headers @{ Authorization = "Bearer $token" }
    $subjectId = $subjects[0].id
    
    $students = Invoke-RestMethod -Uri "$apiUrl/students" -Method Get -Headers @{ Authorization = "Bearer $token" }
    $studentId = $students[0].id

    Write-Host "Main IDs: Branch:$branchId, Session:$sessionId, Section:$sectionId, Student:$studentId"

    # 3. Test Eligibility Toggle
    Write-Host "Testing Eligibility Toggle..."
    $eligBody = @{
        subjectId  = $subjectId
        sessionId  = $sessionId
        term       = "FIRST"
        isEligible = $false
    } | ConvertTo-Json
    $eligResp = Invoke-RestMethod -Uri "$apiUrl/exams/eligibility/$studentId" -Method Post -Body $eligBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Eligibility: $($eligResp | ConvertTo-Json -Depth 1)"

    # 4. Test Batch Publishing
    Write-Host "Testing Batch Publishing..."
    $pubBody = @{
        sectionId = $sectionId
        sessionId = $sessionId
        term      = "FIRST"
        isLocked  = $true
    } | ConvertTo-Json
    $pubResp = Invoke-RestMethod -Uri "$apiUrl/exams/publish" -Method Post -Body $pubBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Publish: $($pubResp | ConvertTo-Json -Depth 1)"

    # 5. Submit a test score
    Write-Host "Submitting test score..."
    $submitBody = @{
        branchId  = $branchId
        subjectId = $subjectId
        sectionId = $sectionId
        sessionId = $sessionId
        term      = "FIRST"
        examTerm  = "FIRST_TERM"
        scores    = @(
            @{ studentId = $studentId; asgn1 = 8; asgn2 = 9; test1 = 15; test2 = 14; examScore = 35 }
        )
    } | ConvertTo-Json
    $submitResp = Invoke-RestMethod -Uri "$apiUrl/exams/submit-scores" -Method Post -Body $submitBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Score Submission: $($submitResp | ConvertTo-Json -Depth 1)"

    # 6. Test Batch ZIP Export
    Write-Host "Testing Batch ZIP Export..."
    # Use Invoke-WebRequest to get status code and save file
    $zipResp = Invoke-WebRequest -Uri "$apiUrl/exams/batch-report/$sectionId/$sessionId/FIRST" -Method Get -Headers @{ Authorization = "Bearer $token" } -OutFile "test_batch.zip" -PassThru
    Write-Host "Batch ZIP HTTP Status: $($zipResp.StatusCode)"

    # 7. Test Annual Report Generation
    Write-Host "Testing Annual Report Generation..."
    $annualResp = Invoke-WebRequest -Uri "$apiUrl/exams/report-annual/$studentId/$sessionId" -Method Get -Headers @{ Authorization = "Bearer $token" } -OutFile "annual_test.pdf" -PassThru
    Write-Host "Annual Report HTTP Status: $($annualResp.StatusCode)"

    Write-Host "--- Verification Complete ---"

}
catch {
    Write-Host "An error occurred: $_"
}
