#!/bin/bash
# Kill any existing process on port 3000
fuser -k 3000/tcp > /dev/null 2>&1

TS=$(date +%s)

# Start backend in background
npm run start > backend_p1.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID $SERVER_PID. Waiting for it to be ready..."
sleep 15

# Bootstrap & Login
echo "--- Bootstrapping ---"
curl -s -X POST http://localhost:3000/auth/bootstrap
echo -e "\nLogging in as Super Admin..."
LOGIN_RES=$(curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"superadmin@basaeer.com","password":"admin123"}')
TOKEN=$(echo $LOGIN_RES | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "CRITICAL: Failed to get Super Admin token. Response: $LOGIN_RES"
  kill $SERVER_PID
  exit 1
fi
echo "Super Admin Token Received."

# 1. Test Permissions Seeding
echo "--- Testing Permissions Seeding ---"
SEED_RES=$(curl -s -X POST http://localhost:3000/permissions/seed \
  -H "Authorization: Bearer $TOKEN")
echo "Seed Response: $SEED_RES"

# 2. Test Academic Sessions CRUD
echo "--- Testing Academic Sessions ---"
SESSION_RES=$(curl -s -X POST http://localhost:3000/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Session $TS\", \"startDate\":\"2025-09-01T00:00:00Z\", \"endDate\":\"2026-07-31T00:00:00Z\", \"isActive\":true}")
echo "Create Session Response: $SESSION_RES"

# 3. Test Branch Isolation
echo "--- Testing Branch Isolation ---"
# Create two branches
B1_RES=$(curl -s -X POST http://localhost:3000/branches \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Campus Alpha $TS\", \"code\":\"A$TS\"}")
B1_ID=$(echo $B1_RES | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$B1_ID" ]; then
  echo "ERROR: Failed to create Campus Alpha. Response: $B1_RES"
  kill $SERVER_PID
  exit 1
fi
echo "Campus Alpha ID: $B1_ID"

B2_RES=$(curl -s -X POST http://localhost:3000/branches \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Campus Beta $TS\", \"code\":\"B$TS\"}")
B2_ID=$(echo $B2_RES | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$B2_ID" ]; then
  echo "ERROR: Failed to create Campus Beta. Response: $B2_RES"
  kill $SERVER_PID
  exit 1
fi
echo "Campus Beta ID: $B2_ID"

# Create a Branch Admin for Campus Alpha
echo "Creating Branch Admin for Alpha..."
ADMIN_ALPHA_RES=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin.alpha.$TS@basaeer.com\", \"password\":\"alpha123\", \"firstName\":\"Alpha\", \"lastName\":\"Admin\", \"role\":\"BRANCH_ADMIN\", \"branchId\":\"$B1_ID\"}")
echo "Admin Alpha Register Response Status: $(echo $ADMIN_ALPHA_RES | grep -o '"id"')"

# Login as Alpha Admin
echo "Logging in as Alpha Admin..."
ALPHA_LOGIN=$(curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin.alpha.$TS@basaeer.com\",\"password\":\"alpha123\"}")
ALPHA_TOKEN=$(echo $ALPHA_LOGIN | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ALPHA_TOKEN" ]; then
  echo "ERROR: Failed to get Alpha Admin token. Response: $ALPHA_LOGIN"
else
  echo "Alpha Admin Token Received."
  # Try to access Campus Beta as Alpha Admin
  echo "Requesting Campus Beta ($B2_ID) as Alpha Admin (Expected: 403 Forbidden)..."
  BETA_ACCESS=$(curl -s -X GET "http://localhost:3000/branches/$B2_ID" \
    -H "Authorization: Bearer $ALPHA_TOKEN")
  echo "Beta Access Response: $BETA_ACCESS"

  # Try to access Campus Alpha as Alpha Admin
  echo "Requesting Campus Alpha ($B1_ID) as Alpha Admin (Expected: 200 OK)..."
  ALPHA_ACCESS=$(curl -s -X GET "http://localhost:3000/branches/$B1_ID" \
    -H "Authorization: Bearer $ALPHA_TOKEN")
  echo "Alpha Access Response Status: $(echo $ALPHA_ACCESS | grep -o '"id"')"
fi

echo "Verification Complete."
fuser -k 3000/tcp > /dev/null 2>&1
