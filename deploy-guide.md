# Deployment Guide: Basaeer App (Supabase + Vercel)

This guide provides step-by-step instructions to deploy the **Basaeer** application using **Supabase** (Database) and **Vercel** (Frontend & Backend Hosting).

## Prerequisites

- [GitHub Account](https://github.com/) (for code repository)
- [Vercel Account](https://vercel.com/)
- [Supabase Account](https://supabase.com/)
- [Node.js](https://nodejs.org/) and `npm` installed locally
- Vercel CLI (optional but recommended): `npm i -g vercel`

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

## Part 2: Backend Deployment (NestJS on Vercel)

Vercel is primarily for frontend, but NestJS can run as Serverless Functions.

### 1. Create Serverless Entry Point
Create a new file `backend/api/index.ts` (create the `api` folder if it doesn't exist):

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();

const createNestServer = async (expressInstance) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  app.enableCors({
    origin: '*', // Adjust this to your frontend URL in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.init();
};

createNestServer(server)
  .then(() => console.log('NestJS initialized'))
  .catch((err) => console.error('NestJS initialization failed', err));

export default server;
```

### 2. Configure Vercel
Create `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.ts"
    }
  ]
}
```

### 3. Deploy Backend
1.  Navigate to `backend`: `cd backend`
2.  Run `vercel` (login if asked).
3.  Set up the project:
    *   Scope: Your account.
    *   Link to existing project: No.
    *   Project Name: `basaeer-backend`.
    *   Directory: `.` (Current directory).
4.  **Environment Variables**:
    *   Go to Vercel Dashboard > Project > Settings > Environment Variables.
    *   Add `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, and any other variables from your `.env`.
5.  **Redeploy**: `vercel --prod`
6.  **Copy the Production URL**: e.g., `https://basaeer-backend.vercel.app`.

---

## Part 3: Frontend Deployment (Next.js on Vercel)

### 1. Update API URL
In your frontend code, ensure you point to the production backend URL.
Update `frontend/.env.production` (or setup env vars in Vercel):

```env
NEXT_PUBLIC_API_URL=https://basaeer-backend.vercel.app
```

### 2. Deploy Frontend
1.  Navigate to `frontend`: `cd frontend`
2.  Run `vercel`.
3.  Set up the project:
    *   Project Name: `basaeer-frontend`.
    *   Directory: `.` (Current directory).
4.  **Environment Variables**:
    *   Add `NEXT_PUBLIC_API_URL` to Vercel Environment Variables.
5.  **Redeploy**: `vercel --prod`

---

## Part 4: Final Steps & Troubleshooting

### 1. CORS Troubleshooting
If the frontend cannot access the backend, check `backend/src/main.ts` (or `api/index.ts` if using serverless). Ensure `enableCors` allows your Vercel frontend domain.

### 2. Prisma Client
In a serverless environment like Vercel, you must generate the Prisma Client in the build step.
Ensure `backend/package.json` has a `postinstall` script:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```
*Correction*: Since we are deploying just the backend folder, Vercel will install dependencies. `prisma generate` is crucial.

### 3. Web Sockets / Cron Jobs
**Important**: Vercel Serverless functions have execution time limits (usually 10s-60s) and are stateless.
*   **Web Sockets**: Will **NOT** work reliably on standard Vercel Serverless. You likely need a third-party service like Pusher or Ably, or host the backend on a specialized platform like **Render**, **Railway**, or **DigitalOcean App Platform** if WebSockets are critical.
*   **Cron Jobs**: Use Vercel Cron Jobs (configured in `vercel.json`) instead of `@nestjs/schedule` if strictly using Vercel.

---

## Alternative: Deploying Backend to Render/Railway (Recommended for NestJS)
If you encounter issues with Serverless limits:
1.  Push code to GitHub.
2.  Connect Repository to **Render** or **Railway**.
3.  Root Directory: `backend`.
4.  Build Command: `npm install && npx prisma generate && npm run build`.
5.  Start Command: `npm run start:prod`.
6.  Add Environment Variables (`DATABASE_URL`, etc.).
This keeps the app running continuously, supporting WebSockets and Cron Jobs natively.
