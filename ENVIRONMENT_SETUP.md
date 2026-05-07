# Environment Setup Guide

This document outlines the necessary environment variables required to run Basaeer School Management System.

## Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Prisma CLI

## Backend Environment Variables (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and fill in the values:

| Variable | Description | Required |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for signing JWT tokens | Yes |
| `BOOTSTRAP_SECRET` | Secret token to initialize the SuperAdmin | Yes |
| `SUPER_ADMIN_PASSWORD` | Password for the initial SuperAdmin | Yes |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | No (defaults to dev) |
| `PORT` | Backend server port | No (defaults to 3001) |

## Frontend Environment Variables (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env.local`:

| Variable | Description | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | URL of the backend API | Yes |

## Bootstrapping the System

1. **Setup Database**:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

2. **Initialize SuperAdmin**:
   After starting the backend, call the bootstrap endpoint with your `BOOTSTRAP_SECRET`:
   ```bash
   curl -X POST http://localhost:3001/auth/bootstrap \
     -H "Content-Type: application/json" \
     -d '{"bootstrapToken": "your-bootstrap-token"}'
   ```

3. **Login**:
   Use the `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` defined in your environment to login.
