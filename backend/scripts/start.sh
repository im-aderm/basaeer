#!/bin/sh
set -e

# Print commands for debugging
set -x

echo "Starting deployment script..."

# Navigate to the backend directory if needed, but the Dockerfile WORKDIR should be /app
# We use npm run to ensure the workspace context and PATH are correctly set up

echo "Running Prisma migrations..."
# We use the script we just added to backend/package.json
# Running it from the root using workspaces is most reliable
npm run migrate:deploy --workspace=backend

echo "Starting application..."
# Start the backend
exec node backend/dist/main.js
