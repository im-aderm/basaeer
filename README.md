# Basaeer Modern Multibranch School Management System (BMSMS)

## 🚀 Quick Start

### Starting the Development Environment

This project is configured to run with a **local PostgreSQL** instance.

#### 1. Database Setup
- Ensure PostgreSQL 15+ is installed on your machine.
- Create a database named `basaeer`.
- Run the following PowerShell script to check your connection:
  ```powershell
  ./start-dev.ps1
  ```

#### 2. Environment Configuration
Update the `backend/.env` file with your local database connection string:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/basaeer?schema=public"
```

### Starting the Application

#### Terminal 1 - Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

### Default Admin Credentials
If the database has been seeded (running `npx prisma migrate dev` usually handles this if `seed.ts` is configured in `package.json`, or run `npx prisma db seed`), use:
```
Email: superadmin@basaeer.com
Password: admin123
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📚 Project Structure
```
basaeer/
├── backend/          # NestJS backend API
├── frontend/         # Next.js frontend
├── start-dev.ps1     # Development environment check script
└── README.md         # This file
```

