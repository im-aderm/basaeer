# Basaer Deployment Guide

## Pre-deployment Checklist

- [x] Branches merged (`feature/events-module` → `main`)
- [x] TypeScript compiles (backend + frontend)
- [x] Database schema pushed successfully
- [x] Seed script runs successfully
- [x] Docker images buildable

## Server Deployment Steps

### 1. SSH into server
```bash
ssh user@your-server
cd /path/to/basaeer
```

### 2. Pull latest code
```bash
git pull origin main
```

### 3. Run deployment script
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. Verify
```bash
docker compose ps
curl http://localhost:3001/health
curl http://localhost:3000/
```

## Manual Deployment (if script fails)

### Stop containers
```bash
docker compose down --remove-orphans
```

### Rebuild images
```bash
docker compose build --no-cache
```

### Wipe database
```bash
docker compose up -d postgres
sleep 5
docker exec basaer-postgres psql -U basaer -d basaer -c "
DO \$\$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname='public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END \$\$;
"
```

### Push schema + seed
```bash
cd backend
npx prisma db push
npx prisma db seed
cd ..
```

### Start services
```bash
docker compose up -d
```

## Default Login Credentials
- **Email**: admin@basaeer.com
- **Password**: Password123!

## Ports
- **Frontend**: 3000
- **Backend API**: 3001
- **PostgreSQL**: 5432
- **Redis**: 6379
- **Nginx**: 80, 443

## Rollback
```bash
git checkout <previous-commit>
docker compose down
docker compose up -d --build
```
