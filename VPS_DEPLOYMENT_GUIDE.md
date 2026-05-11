# 🚀 VPS + Cloudflare Deployment Guide

This handbook details step-by-step instructions for rolling out the Basaeer Application onto your self-hosted Virtual Private Server (VPS), operating under your domain **`basaerschools.com.ng`** and hardened by Cloudflare.

---

## 🏗️ Architecture Summary
1.  **Domain Routing**: Path-based unified single-domain strategy.
    *   `https://basaerschools.com.ng` → Frontend
    *   `https://basaerschools.com.ng/api` → Backend Rest API
    *   `https://basaerschools.com.ng/socket.io` → Backend WebSocket Server
2.  **DNS & SSL**: Cloudflare edge cache ensures zero latency SSL and handles edge-level caching.
3.  **Container Orchestration**: `docker-compose` automates the lifecycle of Postgres, Redis, Node, Next, and Nginx.

---

## 🛠️ Step 1: Cloudflare Prerequisites
Before accessing the server, verify the basic Cloudflare record configurations:

1.  **Add DNS Record**:
    *   Type: `A`
    *   Name: `@` (Root)
    *   IPv4 Address: `YOUR_VPS_IP_ADDRESS`
    *   Proxy status: 🚀 **Proxied (Orange Cloud)**
2.  **SSL/TLS Mode**:
    *   Navigate to SSL/TLS -> Overview -> Set encryption to **Full**. 
    *   *This allows Cloudflare to route through secure channels even if origin has self-signed certificates.*
3.  **WebSockets**:
    *   Navigate to **Network** settings and ensure **WebSockets** is enabled (it's on by default).

---

## 💻 Step 2: VPS Preparation
SSH into your server and prepare the system:

### 1. Install Docker & Compose
Execute the standard Docker installation script:
```bash
# Update package database
sudo apt-get update && sudo apt-get upgrade -y

# Remove older versions
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done

# Install latest engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify installation
docker --version
docker compose version
```

### 2. Install Node & Pull Repository
Ensure Git is active and copy down your audited codebase:
```bash
# Generate an SSH key for github if not already done
# ssh-keygen -t ed25519 -C "your_email@example.com"

git clone git@github.com:YOUR_USERNAME/basaeer.git
cd basaeer
```

---

## 🔒 Step 3: Security & Variables
Create a localized `.env` that the application reads inside Docker.

Copy example to real file:
```bash
cp .env.example .env
```

Edit using `nano .env` and satisfy these fields for your VPS production state:

```ini
# General
NODE_ENV=production
PORT=3001
# VITAL: Use your actual real domain and include the /api route prefix here:
NEXT_PUBLIC_API_URL=https://basaerschools.com.ng/api

# Secrets (Generate these with `openssl rand -hex 64`)
JWT_SECRET=xxxxxxxxxxx
ENCRYPTION_SECRET=xxxxxxxxxxx
BOOTSTRAP_SECRET=your_setup_passphrase

# Databases
POSTGRES_USER=basaeer_prod
POSTGRES_PASSWORD=USE_SECURE_RANDOM_STRING
REDIS_PASSWORD=USE_SECURE_RANDOM_STRING

# Cloudflare R2 Storage (Get these from Cloudflare dashboard R2 section)
R2_ACCOUNT_ID=xxxx
R2_ACCESS_KEY_ID=xxxx
R2_SECRET_ACCESS_KEY=xxxx
R2_BUCKET_NAME=basaeer-uploads
R2_PUBLIC_DOMAIN=https://cdn.basaerschools.com.ng # If you mapped custom bucket domain
```

---

## 🚀 Step 4: One-Click Deployment
Launch the Dockerized ecosystem.

1.  **Build Images**:
    This will perform the multi-stage NPM workspace compilations and generate optimized standalone Next.js artifacts.
    ```bash
    docker compose build --no-cache
    ```

2.  **Start Containers Daemon**:
    ```bash
    docker compose up -d
    ```

3.  **Database Sync & Run Migrations**:
    Ensure the Postgres database schema populates correctly:
    ```bash
    docker compose exec backend npx prisma migrate deploy
    ```

---

## 🔍 Step 5: Validation Checklist
Run these diagnostics from the CLI to verify the system stack is active:

*   **Check container health**:
    ```bash
    docker compose ps
    ```
    *Everything should report `Up (healthy)`.*

*   **Tail application live logs**:
    ```bash
    docker compose logs -f backend
    docker compose logs -f frontend
    ```

*   **Verify REST Access**:
    Visit `https://basaerschools.com.ng/api/health` in your browser. You should receive a JSON payload showing `{"database": "ok", "redis": "ok"}`.

---

## 🔄 Automated Maintenance
Routine tasks executed on the VPS:

### Fetch updates and rebuild
```bash
git pull origin main
docker compose build
docker compose up -d
docker compose exec backend npx prisma migrate deploy
```

### Clean unused Docker space (Disk saver)
```bash
docker system prune -a --volumes
```
