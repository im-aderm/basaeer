# VPS Production Setup Guide

This guide covers the deployment of the Basaeer ERP on a raw Linux VPS (Ubuntu 22.04 or later).

## Architecture

* **Web Server:** NGINX acting as a reverse proxy for API and Frontend.
* **Backend:** NestJS container (Node.js 20+).
* **Frontend:** Next.js container.
* **Database:** PostgreSQL 16 container.
* **Queue:** Redis 7 container with AOF persistence.

## 1. Initial VPS Hardening

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Create a non-root deployment user
adduser deployer
usermod -aG sudo deployer

# Setup Firewall (UFW)
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 2. Install Docker & Docker Compose

```bash
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker deployer
```

## 3. Deployment

```bash
# Login as deployer
su - deployer
git clone https://github.com/im-aderm/basaeer.git
cd basaeer

# Copy environment variables
cp .env.example .env
cp backend/.env.example backend/.env

# Create storage directories and set permissions
mkdir -p /app/public/uploads
mkdir -p /app/public/exports
mkdir -p /app/logs
chmod -R 777 /app/public
chmod -R 777 /app/logs

# Deploy services
docker compose up -d --build
```
