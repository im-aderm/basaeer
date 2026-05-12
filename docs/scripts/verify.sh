#!/bin/bash
# Kill any existing process on port 3000
fuser -k 3000/tcp > /dev/null 2>&1

# Start backend in background
npm run start > backend.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID $SERVER_PID. Waiting for it to be ready..."
sleep 15

# Bootstrap
echo "Running Bootstrap..."
curl -s -X POST http://localhost:3000/auth/bootstrap
echo ""

# Login
echo "Logging in..."
LOGIN_RES=$(curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"superadmin@basaer.com","password":"admin123"}')
echo "Login Response: $LOGIN_RES"

TOKEN=$(echo $LOGIN_RES | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  kill $SERVER_PID
  exit 1
fi

echo "Token received."

# Create Branch
echo "Creating Branch..."
BRANCH_RES=$(curl -s -X POST http://localhost:3000/branches \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Main Branch $(date +%s)\", \"code\":\"B$(date +%s)\"}")

echo "Branch Response: $BRANCH_RES"
BRANCH_ID=$(echo $BRANCH_RES | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$BRANCH_ID" ]; then
  echo "Failed to get Branch ID"
  kill $SERVER_PID
  exit 1
fi

echo "Branch ID: $BRANCH_ID"

# Create Teacher
echo "Creating Teacher..."
curl -s -X POST http://localhost:3000/employees/teachers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"teacher$(date +%s)@basaer.com\", \"password\":\"teach123\", \"firstName\":\"John\", \"lastName\":\"Doe\", \"branchId\":\"$BRANCH_ID\", \"designation\":\"Senior Teacher\"}"
echo ""

# Create Student
echo "Creating Student..."
curl -s -X POST http://localhost:3000/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"student$(date +%s)@basaer.com\", \"password\":\"stud123\", \"firstName\":\"Alice\", \"lastName\":\"Smith\", \"branchId\":\"$BRANCH_ID\"}"
echo ""

echo "Verification Complete."
fuser -k 3000/tcp > /dev/null 2>&1
