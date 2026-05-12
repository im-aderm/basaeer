# Basaer — VPS Deployment Guide

This guide covers deploying the Basaer School Management System on a Linux VPS (Ubuntu 22.04/24.04).

---

## Architecture

```
Internet → Cloudflare DNS (SSL) → VPS (Nginx) → Frontend (Next.js :3000)
                                                → /api/*  → Backend (NestJS :3001)
                                                → /socket.io/ → Backend WebSocket

                                  Backend connects to:
                                    → PostgreSQL (:5432)
                                    → Redis (:6379)
```

Two deployment options:

- **Option A (Docker)** — recommended, one-command start, isolated containers
- **Option B (Manual)** — no Docker, PM2 process manager, direct installs

---

## Option A: Docker Deployment

### A1. Server Requirements

| Software       | Minimum Version | Purpose                 |
| -------------- | --------------- | ----------------------- |
| Ubuntu/Debian  | 22.04 LTS       | Operating system        |
| Docker         | 24+             | Container runtime       |
| Docker Compose | v2              | Container orchestration |
| Git            | 2.0+            | Source code             |

All four fit comfortably on a **2 GB RAM / 2 vCPU VPS**.

### A2. Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Start Docker and enable on boot
sudo systemctl enable docker
sudo systemctl start docker

# Add your user to docker group (avoid sudo for docker commands)
sudo usermod -aG docker $USER

# Verify
docker --version        # 24.0+
docker compose version  # 2.0+
```

Log out and back in for the group change to take effect.

### A3. Clone the Repository

```bash
git clone https://github.com/im-aderm/basaer.git
cd basaer
```

### A4. Configure Environment

```bash
cp .env.example .env
nano .env
```

**Fill in these values at minimum:**

```ini
# Required
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://basaer:YOUR_SECURE_DB_PASSWORD@postgres:5432/basaer?schema=public
JWT_SECRET=                          # openssl rand -hex 64
BOOTSTRAP_SECRET=                    # openssl rand -hex 32
SEED_ADMIN_PASSWORD=SuperAdmin123!
SEED_DEFAULT_PASSWORD=DefaultUser123!

# Core services
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_SECURE_REDIS_PASSWORD

# Encryption
ENCRYPTION_SECRET=                   # openssl rand -hex 64
ENCRYPTION_SALT=basaer-production-salt-2026

# URLs — replace with your actual domain
FRONTEND_URL=https://example.com
CORS_ALLOWED_ORIGINS=https://example.com

# Frontend API URL (seen by browser)
NEXT_PUBLIC_API_URL=https://example.com/api

# Docker credentials
POSTGRES_USER=basaer
POSTGRES_PASSWORD=YOUR_SECURE_DB_PASSWORD
POSTGRES_DB=basaer

# Optional — email, SMS, payments (add when ready)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-login@brevo.com
SMTP_PASS=your-smtp-key
SMTP_FROM=noreply@example.com
TERMII_API_KEY=TL_xxxx
PAYSTACK_SECRET_KEY=sk_live_xxxx
```

**The Docker hostnames `postgres` and `redis` are correct** — they match the Docker Compose service names. Do not change them to `localhost` when using Docker.

### A5. Configure Nginx Domain

The Nginx config is pre-written at `nginx/conf.d/default.conf`. Edit the `server_name`:

```bash
nano nginx/conf.d/default.conf
```

Change line 3:

```nginx
server_name example.com www.example.com;    # Your domain
```

### A6. Build and Start

```bash
# Build images (first time takes 3–5 minutes)
docker compose build --no-cache

# Start all services
docker compose up -d

# Run database migrations
docker compose exec backend npx prisma migrate deploy
```

### A7. Verify Deployment

```bash
# Check all containers are healthy
docker compose ps
# All should show "Up (healthy)"

# Test health endpoint
curl http://localhost/api/health
# Should return {"status":"ok","services":{"postgresql":{...},"redis":{...}}}

# Check logs
docker compose logs -f backend
docker compose logs -f frontend
```

### A8. Update the Application

```bash
git pull origin main
docker compose build
docker compose up -d
docker compose exec backend npx prisma migrate deploy
```

### A9. Maintenance

```bash
# View logs
docker compose logs -f backend

# Restart a service
docker compose restart backend

# Clean old Docker images/volumes
docker system prune -a --volumes
```

---

## Option B: Manual Deployment (No Docker)

Use this if you prefer direct Node.js/PM2 process management.

### B1. Install System Packages

```bash
sudo apt update && sudo apt upgrade -y

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib

# Redis
sudo apt install -y redis-server

# Nginx
sudo apt install -y nginx

# PM2 (process manager)
sudo npm install -g pm2

# Git and build tools
sudo apt install -y git build-essential python3
```

### B2. Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# In the psql prompt:
CREATE USER basaer WITH PASSWORD 'YOUR_SECURE_PASSWORD';
CREATE DATABASE basaer OWNER basaer;
GRANT ALL PRIVILEGES ON DATABASE basaer TO basaer;
\q

# Allow password authentication
sudo nano /etc/postgresql/16/main/pg_hba.conf
# Ensure this line exists:
# local   all   all   md5

sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

### B3. Configure Redis

```bash
# Set a password
sudo nano /etc/redis/redis.conf
# Uncomment and set:
# requirepass YOUR_SECURE_REDIS_PASSWORD

sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

### B4. Clone and Configure

```bash
git clone https://github.com/im-aderm/basaer.git
cd basaer

# Backend environment
cp backend/.env.example backend/.env
nano backend/.env
```

**Critical difference from Docker**: use `localhost` not Docker service names:

```ini
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://basaer:YOUR_DB_PASSWORD@localhost:5432/basaer?schema=public

JWT_SECRET=                          # openssl rand -hex 64
BOOTSTRAP_SECRET=                    # openssl rand -hex 32
SEED_ADMIN_PASSWORD=SuperAdmin123!
SEED_DEFAULT_PASSWORD=DefaultUser123!

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD

ENCRYPTION_SECRET=                   # openssl rand -hex 64
ENCRYPTION_SALT=basaer-production-salt-2026

FRONTEND_URL=https://example.com
CORS_ALLOWED_ORIGINS=https://example.com

SUPER_ADMIN_EMAIL=admin@example.com
DB_POOL_SIZE=20
```

```bash
# Frontend environment
nano frontend/.env.local
```

```ini
NEXT_PUBLIC_API_URL=https://example.com/api
```

### B5. Build the Application

```bash
# Install all dependencies
npm install

# Build shared types package
npm run build --workspace=@basaer/shared-types

# Build backend
cd backend
npx prisma generate
npm run build

# Run migrations
npx prisma migrate deploy

cd ..

# Build frontend
npm run build --workspace=frontend
```

### B6. Start with PM2

```bash
# Start backend
pm2 start backend/dist/main.js \
  --name basaer-backend \
  --max-memory-restart 2048M

# Start frontend
pm2 start node_modules/.bin/next \
  --name basaer-frontend \
  -- start \
  --cwd frontend

# Save PM2 config for auto-start on reboot
pm2 save
pm2 startup
# Follow the command PM2 prints

# Check status
pm2 status
pm2 logs
```

### B7. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/basaer
```

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    client_max_body_size 50M;

    # Static uploads
    location /uploads/ {
        alias /home/YOUR_USER/basaer/backend/public/uploads/;
        expires 30d;
    }

    # API
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/basaer /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default if exists
sudo nginx -t                              # Test config
sudo systemctl reload nginx
sudo systemctl enable nginx
```

---

## Post-Deployment (Both Options)

### Bootstrap the SuperAdmin

```bash
# Create the initial SuperAdmin account
curl -X POST http://localhost/api/auth/bootstrap \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-token: YOUR_BOOTSTRAP_SECRET"
```

### DNS Setup

1. Point your domain's **A record** to your VPS IP address
2. If using Cloudflare:
   - SSL/TLS mode: **Full**
   - Proxy status: **Proxied (orange cloud)**
   - Enable WebSockets under Network settings
3. Wait for DNS propagation (5–30 minutes)

### SSL with Certbot (Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
# Follow the prompts
# Certbot auto-renews certificates
```

### Firewall

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

### Verify Everything

1. Visit `https://example.com` — should see the Basaer landing page
2. Visit `https://example.com/login` — should see the login form
3. Visit `https://example.com/api/health` — should return JSON with services status
4. Login with the SuperAdmin credentials from the bootstrap step

---

## Troubleshooting

### Containers fail to start

```bash
docker compose logs postgres    # Check DB started
docker compose logs redis       # Check Redis started
docker compose logs backend     # Check backend errors
```

### Database connection refused

- Docker: `DATABASE_URL` must use `@postgres:5432` not `@localhost:5432`
- Manual: PostgreSQL must have password auth enabled in `pg_hba.conf`

### Port already in use

```bash
sudo lsof -i :3001            # Check what's on port 3001
sudo lsof -i :3000            # Check what's on port 3000
```

### PM2 processes dying

```bash
pm2 logs basaer-backend      # Check backend logs
pm2 logs basaer-frontend     # Check frontend logs
# Increase memory limit:
pm2 start ... --max-memory-restart 4096M
```

---

## Directory Structure After Deployment

```
basaer/
├── backend/
│   ├── dist/           # Compiled NestJS output
│   ├── prisma/         # Migrations + schema
│   └── public/         # Uploads + exports
├── frontend/
│   └── .next/          # Next.js build output
├── nginx/
│   └── conf.d/         # Nginx site configs
├── docker-compose.yml
├── .env                # Environment variables
└── .env.example        # Reference template
```
