#!/bin/bash

API_URL="http://localhost:3000"

echo "--- BMSMS Nigerian Standards Verification ---"

# 1. Authenticate
echo "Authenticating Super Admin..."
LOGIN_RESP=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "superadmin@basaer.com", "password": "admin123"}')
TOKEN=$(echo $LOGIN_RESP | jq -r '.access_token')

if [ "$TOKEN" == "null" ]; then
  echo "Auth failed!"
  exit 1
fi

# 2. Ensure Test Data
BRANCH_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/branches" | jq -r '.[0].id')
SESSION_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/exams/sessions" | jq -r '.[0].id')

if [ "$SESSION_ID" == "null" ] || [ "$SESSION_ID" == "" ]; then
  echo "Creating test session..."
  SESSION_RESP=$(curl -s -X POST "$API_URL/exams/sessions" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "2024/2025 Test Session",
      "startDate": "2024-09-01T00:00:00.000Z",
      "endDate": "2025-07-31T00:00:00.000Z"
    }')
  SESSION_ID=$(echo $SESSION_RESP | jq -r '.id')
fi

CLASS_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/classes?branchId=$BRANCH_ID" | jq -r '.[0].id')
SECTION_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/classes?branchId=$BRANCH_ID" | jq -r '.[0].sections[0].id')
SUBJECT_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/subjects" | jq -r '.[0].id')
STUDENT_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/students" | jq -r '.[0].id')

echo "Main IDs: Branch:$BRANCH_ID, Session:$SESSION_ID, Section:$SECTION_ID, Student:$STUDENT_ID"

# 3. Test Eligibility Toggle
echo "Testing Eligibility Toggle..."
ELIG_RESP=$(curl -s -X POST "$API_URL/exams/eligibility/$STUDENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"subjectId\": \"$SUBJECT_ID\",
    \"sessionId\": \"$SESSION_ID\",
    \"term\": \"FIRST\",
    \"isEligible\": false
  }")
echo "Eligibility: $ELIG_RESP"

# 4. Test Batch Publishing
echo "Testing Batch Publishing..."
PUB_RESP=$(curl -s -X POST "$API_URL/exams/publish" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sectionId\": \"$SECTION_ID\",
    \"sessionId\": \"$SESSION_ID\",
    \"term\": \"FIRST\",
    \"isLocked\": true
  }")
echo "Publish: $PUB_RESP"

# 5. Submit a test score to ensure record exists for annual/batch
echo "Submitting test score..."
SUBMIT_RESP=$(curl -s -X POST "$API_URL/exams/submit-scores" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"branchId\": \"$BRANCH_ID\",
    \"subjectId\": \"$SUBJECT_ID\",
    \"sectionId\": \"$SECTION_ID\",
    \"sessionId\": \"$SESSION_ID\",
    \"term\": \"FIRST\",
    \"examTerm\": \"FIRST_TERM\",
    \"scores\": [{ \"studentId\": \"$STUDENT_ID\", \"asgn1\": 8, \"asgn2\": 9, \"test1\": 15, \"test2\": 14, \"examScore\": 35 }]
  }")
echo "Score Submission: $SUBMIT_RESP"

# 6. Test Batch ZIP Export
echo "Testing Batch ZIP Export..."
ZIP_STATUS=$(curl -s -o test_batch.zip -w "%{http_code}" -X GET "$API_URL/exams/batch-report/$SECTION_ID/$SESSION_ID/FIRST" \
  -H "Authorization: Bearer $TOKEN")
echo "Batch ZIP HTTP Status: $ZIP_STATUS"

# 7. Test Annual Report Generation
echo "Testing Annual Report Generation..."
ANNUAL_STATUS=$(curl -s -o annual_test.pdf -w "%{http_code}" -X GET "$API_URL/exams/report-annual/$STUDENT_ID/$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Annual Report HTTP Status: $ANNUAL_STATUS"

echo "--- Verification Complete ---"
