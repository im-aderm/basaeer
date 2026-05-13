# Production Environment Audit Checklist

## Pre-Deployment Secrets & Configuration

### 1. Secrets to Rotate (Generate fresh values)
```bash
# Generate new secrets
BOOTSTRAP_SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_SALT=$(openssl rand -hex 16)
ENCRYPTION_SECRET=$(openssl rand -hex 32)
QR_SIGNING_SECRET=$(openssl rand -hex 32)
PAYSTACK_SECRET_KEY=<from Paystack dashboard>
REDIS_PASSWORD=$(openssl rand -hex 16)
```

### 2. Environment Variables to Configure
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/basaer?schema=public
DB_POOL_SIZE=20                    # Tune based on VPS: start at 10, max 40

# Secrets (rotate all)
JWT_SECRET=<rotated>
JWT_EXPIRES_IN=7d
ENCRYPTION_SALT=<rotated>
ENCRYPTION_SECRET=<rotated>
QR_SIGNING_SECRET=<rotated>
BOOTSTRAP_SECRET=<rotated>

# Paystack
PAYSTACK_SECRET_KEY=<rotated>
PAYSTACK_PUBLIC_KEY=<from dashboard>

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<rotated>

# Frontend URL
FRONTEND_URL=https://basaerschools.com.ng
CORS_ALLOWED_ORIGINS=https://basaerschools.com.ng

# Storage (R2/S3)
R2_ACCESS_KEY_ID=<from Cloudflare>
R2_SECRET_ACCESS_KEY=<from Cloudflare>
R2_BUCKET_NAME=basaer-uploads
R2_PUBLIC_DOMAIN=https://uploads.basaerschools.com.ng
UPLOAD_DRIVER=s3                    # or 'local'

# Google Meet
GOOGLE_MEET_WEBHOOK_SECRET=<rotated>

# Optional
PORT=3001
NODE_ENV=production
```

### 3. Database Pool Size Optimization
Current default: `DB_POOL_SIZE=20`
- **2GB VPS**: set to `10`
- **4GB VPS**: set to `20` (current default - OK)
- **8GB VPS**: set to `30-40`

### 4. Storage Permissions
```bash
# If using local storage:
mkdir -p public/uploads/admissions
mkdir -p public/uploads/payments
mkdir -p public/exports
mkdir -p logs
chmod -R 755 public/uploads
chmod -R 755 public/exports
chmod -R 755 logs
```

### 5. Nginx SSL (One-time setup)
```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d basaerschools.com.ng -d www.basaerschools.com.ng

# Verify auto-renewal
certbot renew --dry-run
```

### 6. Pre-Flight Checks
```bash
# 1. Run all migrations
cd backend && npx prisma migrate deploy

# 2. Build both projects
cd backend && npm run build
cd frontend && npm run build

# 3. Run tests  
cd backend && npm test

# 4. Verify health endpoint
curl https://basaerschools.com.ng/api/v1/health

# 5. Verify detailed health
curl https://basaerschools.com.ng/api/v1/health/detailed

# 6. Test login flow
curl -X POST https://basaerschools.com.ng/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"your-password"}'

# 7. Verify branding endpoint (public)
curl https://basaerschools.com.ng/api/v1/branches/<branch-id>/branding
```

### 7. Monitoring Commands
```bash
# Check logs
tail -f logs/combined.log
tail -f logs/error.log

# Monitor PostgreSQL
htop                                           # CPU/Memory
docker stats basaer-postgres                   # Container resources
docker logs basaer-backend --tail 100          # API logs

# Test rate limiting
ab -n 100 -c 10 https://basaerschools.com.ng/api/v1/auth/login
```

### 8. Rollback Plan
```bash
# Database rollback
cd backend && npx prisma migrate down 1

# Application rollback
git revert HEAD --no-edit
cd backend && npm run build
cd frontend && npm run build
docker compose down && docker compose up -d
```
