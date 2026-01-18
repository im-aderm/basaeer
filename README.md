# Basaeer Modern Multibranch School Management System (BMSMS)

## 🚀 Quick Start

### Starting the Development Environment

**IMPORTANT:** Before you can log in, you must start the database!

```bash
# Run this script every time you start working on the project
./start-dev.sh
```

This script will:
- Check if Docker is running
- Start the PostgreSQL database container
- Display the default admin credentials

### Default Admin Credentials

```
Email: superadmin@basaeer.com
Password: admin123
```

**Note:** These credentials are permanent and will work every time, as long as the database is running.

### Starting the Application

After running `start-dev.sh`, start the backend and frontend:

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🔧 Troubleshooting

### "Invalid credentials" error

This usually means the database isn't running. Run:

```bash
./start-dev.sh
```

### Check if database is running

```bash
docker ps | grep basaeer_db
```

If you don't see the container, it's stopped. Run `./start-dev.sh` to start it.

### Manually start the database

```bash
docker start basaeer_db
```

## 📚 Project Structure

```
basaeer/
├── backend/          # NestJS backend API
├── frontend/         # Next.js frontend
├── start-dev.sh      # Development environment startup script
└── README.md         # This file
```

## 🗄️ Database

The project uses PostgreSQL running in a Docker container named `basaeer_db`.

**Important:** The database container stops when you shut down your computer or Docker. You must restart it using `./start-dev.sh` before you can use the application.
