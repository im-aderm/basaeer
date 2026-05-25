#!/bin/bash
# Basaer Production Deployment Script
# Run this on the production server after pulling latest code.
# Usage: chmod +x deploy.sh && ./deploy.sh

set -e

echo "=========================================="
echo "  Basaer Production Deployment"
echo "=========================================="
echo ""

# 1. Pull latest code
echo "[1/7] Pulling latest code..."
git pull origin main
echo ""

# 2. Stop existing containers
echo "[2/7] Stopping existing containers..."
docker compose down --remove-orphans
echo ""

# 3. Build Docker images
echo "[3/7] Building Docker images..."
docker compose build --no-cache
echo ""

# 4. Wipe database (fresh start)
echo "[4/7] Wiping database..."
docker compose up -d postgres
sleep 5
docker exec basaer-postgres psql -U basaer -d basaer -c "
DO \$\$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname='public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END \$\$;
"
echo "Database wiped."
echo ""

# 5. Push schema + seed
echo "[5/7] Pushing schema and seeding..."
ln -sf ../.env backend/.env
cd backend
npx prisma db push
npx prisma db seed
cd ..
echo ""

# 6. Start all services
echo "[6/7] Starting all services..."
docker compose up -d
echo ""

# 7. Wait and verify
echo "[7/7] Waiting for services to start..."
sleep 15

echo ""
echo "=========================================="
echo "  Health Check Results"
echo "=========================================="
docker compose ps
echo ""

# Test endpoints
echo "Testing backend health..."
curl -sf http://localhost:3001/health > /dev/null && echo "  Backend: OK" || echo "  Backend: FAILED"

echo "Testing frontend health..."
curl -sf http://localhost:3000/ > /dev/null && echo "  Frontend: OK" || echo "  Frontend: FAILED"

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Login: admin@basaeer.com / Password123!"
echo "Frontend: https://basaerschools.com.ng"
echo "Backend API: https://basaerschools.com.ng/api"
echo ""
