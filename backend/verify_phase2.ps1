$apiUrl = "http://localhost:3000"
$logFile = "verify_phase2.log"

Write-Output "=== Basaeer Phase 2 Verification Started ===" | Tee-Object -FilePath $logFile

# 1. Authenticate as Super Admin
Write-Output "Step 1: Authenticating as Super Admin..." | Tee-Object -FilePath $logFile -Append
try {
    $loginBody = @{ email = "superadmin@basaeer.com"; password = "admin123" } | ConvertTo-Json
    $saLogin = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $saToken = $saLogin.access_token

    if (-not $saToken) {
        Write-Output "FAILED: Super Admin authentication failed" | Tee-Object -FilePath $logFile -Append
        exit 1
    }
    Write-Output "SUCCESS: Super Admin authenticated" | Tee-Object -FilePath $logFile -Append
}
catch {
    Write-Output "FAILED: Super Admin authentication error: $_" | Tee-Object -FilePath $logFile -Append
    exit 1
}

# 2. Extract Branch IDs
try {
    $branches = Invoke-RestMethod -Uri "$apiUrl/branches" -Method Get -Headers @{ Authorization = "Bearer $saToken" }
    $branch1Id = $branches[0].id
    $branch2Id = $branches[1].id
    
    if (-not $branch1Id -or -not $branch2Id) {
        # Fallback if branches don't exist, try to create them or error out. 
        # Assuming they exist as per original script logic which just took [0] and [1].
        Write-Output "WARNING: Could not find two branches. Ensuring they exist..." | Tee-Object -FilePath $logFile -Append
        # (Skipping creation logic for brevity, assuming prior script ran or DB has data)
    }

    Write-Output "Testing with Branch 1: $branch1Id and Branch 2: $branch2Id" | Tee-Object -FilePath $logFile -Append

    # 3. Create a Class in Branch 1
    Write-Output "Step 3: Creating Class in Branch 1..." | Tee-Object -FilePath $logFile -Append
    $classBody = @{ name = "Grade 10 - Science"; branchId = $branch1Id } | ConvertTo-Json
    $class1 = Invoke-RestMethod -Uri "$apiUrl/classes" -Method Post -Body $classBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $saToken" }
    $class1Id = $class1.id
    Write-Output "Created Class 1: $class1Id" | Tee-Object -FilePath $logFile -Append

    # 4. Create a Section for Class 1
    Write-Output "Step 4: Creating Section for Class 1..." | Tee-Object -FilePath $logFile -Append
    $sectionBody = @{ name = "Section A" } | ConvertTo-Json
    $section1 = Invoke-RestMethod -Uri "$apiUrl/classes/$class1Id/sections" -Method Post -Body $sectionBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $saToken" }
    $section1Id = $section1.id
    Write-Output "Created Section 1: $section1Id" | Tee-Object -FilePath $logFile -Append

    # 5. Create a Student in Branch 1
    Write-Output "Step 5: Admitting Student to Branch 1..." | Tee-Object -FilePath $logFile -Append
    $ts = Get-Date -UFormat %s
    $ts = [Math]::Floor($ts)
    $studentBody = @{
        firstName = "Test"
        lastName  = "Student"
        email     = "student.b1.$ts@test.com"
        password  = "student123"
        branchId  = $branch1Id
        classId   = $class1Id
        sectionId = $section1Id
    } | ConvertTo-Json
    
    $student1Res = Invoke-RestMethod -Uri "$apiUrl/students" -Method Post -Body $studentBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $saToken" }
    $student1Id = $student1Res.student.id
    Write-Output "Created Student 1: $student1Id" | Tee-Object -FilePath $logFile -Append

    # 6. Verify Isolation
    Write-Output "Step 6: Verifying student list for Branch 1..." | Tee-Object -FilePath $logFile -Append
    $b1Students = Invoke-RestMethod -Uri "$apiUrl/students?branchId=$branch1Id" -Method Get -Headers @{ Authorization = "Bearer $saToken" }
    $b1Count = $b1Students.Count
    Write-Output "Students in Branch 1: $b1Count" | Tee-Object -FilePath $logFile -Append

    Write-Output "Step 7: Verifying student list for Branch 2 (should not see Branch 1 student)..." | Tee-Object -FilePath $logFile -Append
    $b2Students = Invoke-RestMethod -Uri "$apiUrl/students?branchId=$branch2Id" -Method Get -Headers @{ Authorization = "Bearer $saToken" }
    
    $b2Match = $null
    if ($b2Students) {
        $b2Match = $b2Students | Where-Object { $_.id -eq $student1Id }
    }

    if (-not $b2Match) {
        Write-Output "SUCCESS: Branch isolation confirmed. Student 1 not visible in Branch 2 filtered query." | Tee-Object -FilePath $logFile -Append
    }
    else {
        Write-Output "FAILED: Branch isolation violation. Student 1 visible in Branch 2 query." | Tee-Object -FilePath $logFile -Append
    }

    # 8. Mark Attendance
    Write-Output "Step 8: Marking Attendance for Student 1..." | Tee-Object -FilePath $logFile -Append
    $attDate = Get-Date -Format "yyyy-MM-dd"
    $attBody = @{
        studentId = $student1Id
        date      = $attDate
        status    = "PRESENT"
        sectionId = $section1Id
    } | ConvertTo-Json

    $attMark = Invoke-RestMethod -Uri "$apiUrl/attendance" -Method Post -Body $attBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $saToken" }
    Write-Output "Attendance Marked: $($attMark.status)" | Tee-Object -FilePath $logFile -Append

    # 9. Verify Attendance retrieval
    Write-Output "Step 9: Retrieving Attendance for Section 1..." | Tee-Object -FilePath $logFile -Append
    $attList = Invoke-RestMethod -Uri "$apiUrl/attendance/section?sectionId=$section1Id&date=$attDate" -Method Get -Headers @{ Authorization = "Bearer $saToken" }
    $attCount = $attList.Count
    Write-Output "Attendance records found: $attCount" | Tee-Object -FilePath $logFile -Append

    if ($attCount -gt 0) {
        Write-Output "SUCCESS: Attendance marked and retrieved." | Tee-Object -FilePath $logFile -Append
    }
    else {
        Write-Output "FAILED: Attendance record not found." | Tee-Object -FilePath $logFile -Append
    }

}
catch {
    Write-Output "An error occurred: $_" | Tee-Object -FilePath $logFile -Append
}

Write-Output "=== Phase 2 Verification Completed ===" | Tee-Object -FilePath $logFile -Append
