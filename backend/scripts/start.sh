#!/bin/sh

echo "Starting deployment script..."

echo "Running Prisma migrations..."
npm run migrate:deploy --workspace=backend
MIGRATE_EXIT=$?

if [ $MIGRATE_EXIT -ne 0 ]; then
  echo "WARNING: Prisma migrations exited with code $MIGRATE_EXIT"
  echo "Attempting to resolve failed migrations and retry..."

  MIGRATE_RESOLVED=false

  FAILED_MIGRATIONS=$(npx prisma migrate status --schema=backend/prisma/schema.prisma 2>&1 | grep -oP 'migration name: \K\S+' || true)

  if [ -n "$FAILED_MIGRATIONS" ]; then
    echo "Found failed migrations, attempting to mark as rolled back..."
    for MIGRATION_NAME in $FAILED_MIGRATIONS; do
      echo "  Marking $MIGRATION_NAME as rolled back..."
      npx prisma migrate resolve --rolled-back "$MIGRATION_NAME" --schema=backend/prisma/schema.prisma 2>&1 || true
    done
    MIGRATE_RESOLVED=true
  fi

  echo "Retrying Prisma migrations..."
  npm run migrate:deploy --workspace=backend
  RETRY_EXIT=$?

  if [ $RETRY_EXIT -ne 0 ]; then
    echo "ERROR: Prisma migrations failed after retry (exit code $RETRY_EXIT)"
    echo "Starting application anyway - some features may be unavailable"
  fi
fi

echo "Starting application..."
exec node backend/dist/main.js