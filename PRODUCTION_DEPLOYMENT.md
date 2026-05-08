# Production Deployment & Infrastructure Guide

This guide covers the end-to-step process for deploying the Basaeer application to production using **Railway**, **Vercel**, and **Cloudflare R2**. 

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Environment Setup](#environment-setup)
3. [Cloudflare R2 Setup](#cloudflare-r2-setup)
4. [Railway Backend Setup](#railway-backend-setup)
5. [Vercel Frontend Setup](#vercel-frontend-setup)
6. [CI/CD Configuration](#cicd-configuration)
7. [Production Deployment Checklist](#production-deployment-checklist)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## 1. Architecture Overview

- **Frontend:** Next.js deployed on **Vercel** (Serverless + Edge Network).
- **Backend:** NestJS deployed as a Docker container on **Railway**.
- **Database:** PostgreSQL deployed on **Railway** (Managed).
- **Cache & Queue:** Redis deployed on **Railway** (Managed).
- **File Storage:** Cloudflare R2 (S3-compatible, no egress fees).

---

## 2. Environment Setup

A sample `.env.example` has been provided at the root of the repository. You must generate real values for production.

### Generating Keys
- **JWT Secrets**: Generate strong random keys using `openssl rand -hex 64`.

Copy the `.env.example` to your Railway project environment variables and Vercel project environment variables where appropriate.

---

## 3. Cloudflare R2 Setup

Cloudflare R2 handles all uploads (images, PDFs, documents) securely.

### Step 1: Create a Bucket
1. Log in to Cloudflare Dashboard -> **R2**.
2. Click **Create Bucket**.
3. Name the bucket (e.g., `basaeer-production`).
4. Select your preferred location or leave it automatic.

### Step 2: Generate API Credentials
1. Go to the R2 overview page and click **Manage R2 API Tokens**.
2. Click **Create API Token**.
3. Permissions: **Object Read & Write**.
4. Specify the specific bucket `basaeer-production`.
5. Copy the **Access Key ID** and **Secret Access Key** immediately (they are shown only once).

### Step 3: Public Access (Custom Domain)
1. In your bucket settings, go to the **Settings** tab.
2. Scroll to **Public Access**.
3. Click **Connect Domain**.
4. Enter your custom domain (e.g., `cdn.basaeer.com`). Cloudflare will automatically configure DNS.
5. Provide this domain as `R2_PUBLIC_DOMAIN` in your environment variables.

---

## 4. Railway Backend Setup

Railway will host the NestJS Backend, PostgreSQL Database, and Redis server.

### Step 1: Create Project & Provision Databases
1. Go to Railway Dashboard and click **New Project**.
2. Select **Provision PostgreSQL**.
3. Click **New -> Database -> Provision Redis**.

### Step 2: Deploy Backend Repository
1. Click **New -> GitHub Repo**.
2. Select your repository.
3. Railway will attempt to detect the build method. It should automatically detect the `railway.json` and `Dockerfile.railway` we configured.

### Step 3: Configure Environment Variables
Navigate to your Backend Service -> **Variables**. Add the variables from `.env.example`, including:
- `DATABASE_URL` (Reference the Railway Postgres URL)
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` (Reference Railway Redis)
- `R2_*` variables from Cloudflare
- `JWT_SECRET` etc.

### Step 4: Build & Deploy
Railway will use the `Dockerfile.railway` to build the application and run `npx prisma migrate deploy` followed by `node backend/dist/main.js` based on our `railway.json`.

---

## 5. Vercel Frontend Setup

1. Go to Vercel and create a **New Project**.
2. Import your GitHub repository.
3. In **Framework Preset**, Next.js will be auto-detected.
4. Set the **Root Directory** to `frontend`.
5. Set Environment Variables:
   - `NEXT_PUBLIC_API_URL` -> Your Railway API URL (e.g., `https://api.basaeer.com`)
6. Click **Deploy**.

---

## 6. CI/CD Configuration

By connecting your GitHub repository to Railway and Vercel, deployments will happen automatically:
- **Production Branch (`main`)**: Commits to `main` automatically trigger production deployments on both Railway and Vercel.
- **Preview Deployments**: PRs will generate preview environments on Vercel automatically.

---

## 7. Production Deployment Checklist

Before announcing the launch, verify the following:

- [ ] **Database Setup**: `DATABASE_URL` is configured correctly, and Prisma migrations successfully ran.
- [ ] **Redis Connection**: BullMQ queues and WebSockets start without connection errors.
- [ ] **Storage Checks**: File uploads (admissions, payment proofs) successfully land in the Cloudflare R2 bucket.
- [ ] **CORS Configuration**: `CORS_ALLOWED_ORIGINS` in Railway exactly matches the frontend URL.
- [ ] **Environment Protection**: No sensitive `.env` files are checked into version control.
- [ ] **SSL/TLS**: Custom domains on Railway, Vercel, and Cloudflare R2 have active SSL certificates.
- [ ] **Rate Limiting**: Throttler is enabled in `AppModule` to prevent abuse.

---

## 8. Troubleshooting Guide

**Problem: Application crashes on startup (Railway)**
- **Check**: Railway Deploy Logs.
- **Common Cause**: Database connection failed, or Prisma migrations failed. Verify `DATABASE_URL`. Ensure you appended `?connection_limit=...` if necessary.

**Problem: File uploads are failing (500 Error)**
- **Check**: Railway Logs for S3Client errors.
- **Common Cause**: Invalid R2 Credentials or `R2_ACCOUNT_ID` is missing. Ensure the credentials have *Object Read & Write* permissions.

**Problem: CORS errors on the frontend**
- **Check**: Browser console network tab.
- **Common Cause**: The frontend URL is not included in the `CORS_ALLOWED_ORIGINS` environment variable on the backend. Make sure the scheme (`https://`) is exact.

**Problem: BullMQ/Redis connections timing out**
- **Check**: Railway Redis connection logs.
- **Common Cause**: `REDIS_HOST` or `REDIS_PASSWORD` are incorrect. Railway sometimes assigns internal `.railway.internal` hostnames, which are preferred.
