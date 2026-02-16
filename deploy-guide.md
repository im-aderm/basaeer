# Deployment Guide: Basaeer App (Supabase + Netlify)

This guide provides step-by-step instructions to deploy the **Basaeer** application using **Supabase** (Database) and **Netlify** (Frontend & Backend Hosting).

## Prerequisites

- [GitHub Account](https://github.com/) (for code repository)
- [Netlify Account](https://www.netlify.com/)
- [Supabase Account](https://supabase.com/)
- [Node.js](https://nodejs.org/) and `npm` installed locally
- Netlify CLI (recommended): `npm i -g netlify-cli`

---

## Part 1: Supabase Setup (Database)

1.  **Create a Project**:
    *   Log in to Supabase and click **"New Project"**.
    *   Select your organization, give it a name (e.g., `basaeer-db`), and set a strong database password. *Save this password immediately.*
    *   Choose a region close to your target users.

2.  **Get Configuration Details**:
    *   Go to **Project Settings** > **Database**.
    *   Under **Connection String**, select **URI**.
    *   Copy the **Transaction Mode** connection string (Port 6543) - This will be your `DATABASE_URL`.
    *   Copy the **Session Mode** connection string (Port 5432) - This will be your `DIRECT_URL` (needed for Prisma migrations).

3.  **Configure Backend for Supabase**:
    *   In `backend/.env` (locally), update:
        ```env
        DATABASE_URL="postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
        DIRECT_URL="postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
        ```
    *   *Note*: Ensure `?pgbouncer=true` is appended to `DATABASE_URL` if using Transaction Mode.

4.  **Run Migrations**:
    *   From your local `backend` directory, run:
        ```bash
        npx prisma migrate deploy
        ```
    *   This will push your schema to the live Supabase database.

---

## Part 2: Backend Deployment (NestJS on Netlify)

The backend is configured to run as a Serverless Function on Netlify using `@vendia/serverless-express`.

### 1. Configuration Check
Ensure `backend/netlify.toml` exists with the following configuration:
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[functions]
  external_node_modules = ["@nestjs/microservices", "@nestjs/websockets", "class-transformer", "class-validator", "pg", "reflect-metadata", "rxjs"]
  node_bundler = "esbuild"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/api"
  status = 200
```

### 2. Deploy via Netlify CLI (Manual)
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Login to Netlify (if not already):
    ```bash
    netlify login
    ```
3.  Initialize the site:
    ```bash
    netlify init
    ```
    - Choose "Create & configure a new site".
    - Team: Select your team.
    - Site name: e.g., `basaeer-backend`.
4.  **Environment Variables**:
    - Go to [Netlify Dashboard](https://app.netlify.com/).
    - Select your site > **Site configuration** > **Environment variables**.
    - Add `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, and other `.env` variables.
5.  Deploy:
    ```bash
    netlify deploy --prod
    ```
6.  **Copy the Production URL**: e.g., `https://basaeer-backend.netlify.app`.

---

## Part 3: Frontend Deployment (Next.js on Netlify)

The frontend is configured to use `@netlify/plugin-nextjs` for full Next.js feature support.

### 1. Configuration Check
Ensure `frontend/netlify.toml` exists:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Troubleshooting Netlify Frontend Builds

### 1. CORS Troubleshooting
If the frontend cannot access the backend, check `backend/src/main.ts` (or `api/index.ts` if using serverless). Ensure `enableCors` allows your Netlify frontend domain.

### 2. Monorepo Build Errors (Missing script: "build")
If Netlify deployment fails with `npm error Missing script: "build"`, it means it is trying to build from the root directory. To fix this:
- **Option A (Recommended)**: In Netlify Site Settings > Build & Deploy, set the **Base directory** to `frontend` (for frontend site) or `backend` (for backend site).
- **Option B (Patch)**: We have added a root `package.json` script that redirects the build to the frontend: `"build": "npm install --prefix frontend && npm run build --prefix frontend"`. This fixes the default root build.

### 3. "Page Not Found" (404) on Frontend
If you see a 404 error:
- Ensure the build completed successfully.
- Verify that `@netlify/plugin-nextjs` is installed and running (check build logs).
- Provide the correct publish directory (usually `.next` for Next.js with the plugin).

### 2. Update API URL
In your frontend code or environment variables, point to the production backend URL.

### 3. Database Seeding (Crucial for "Invalid Credentials")
If you see "Invalid Credentials" after deployment, it likely means your production Supabase database is empty. You must seed it with the initial admin user.

**Run this locally (pointing to your Supabase DB):**
1.  Get your **Supabase Connection String** (Transaction/Session/Pooled mode).
2.  Update your local `backend/.env` `DATABASE_URL` to point to Supabase (temporarily) OR run the command with the var:
    ```bash
    # Linux/Mac
    export DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
    cd backend
    npx prisma db push
    npx prisma db seed
    ```
3.  **Default Credentials**:
    *   **Email**: `superadmin@basaeer.com`
    *   **Password**: `admin123`

### 4. Deploy via Netlify CLI (Manual)
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Initialize the site:
    ```bash
    netlify init
    ```
    - Choose "Create & configure a new site".
    - Site name: e.g., `basaeer-frontend`.
3.  **Environment Variables**:
    - Add `NEXT_PUBLIC_API_URL` to Netlify Environment Variables.
    - Value: `https://basaeer-backend.netlify.app` (Function URL typically accessible via the site root if redirects are set up correctly, or `https://basaeer-backend.netlify.app/.netlify/functions/api` depending on your client configuration).
    - *Tip*: With the redirect rule in `backend/netlify.toml`, calls to `https://basaeer-backend.netlify.app/api/...` should forward to the function.
4.  Deploy:
    ```bash
    netlify deploy --prod
    ```

---

## Verification
- **Backend**: Visit `https://basaeer-backend.netlify.app/api/health` (or your health check endpoint).
- **Frontend**: Visit `https://basaeer-frontend.netlify.app` and try logging in.
