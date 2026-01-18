#!/bin/bash

echo "🚀 Starting Basaeer Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start the database container
echo "📦 Starting PostgreSQL database..."
docker start basaeer_db

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 3

# Check if database is accessible
if docker exec basaeer_db pg_isready -U basaeer > /dev/null 2>&1; then
    echo "✅ Database is ready!"
else
    echo "⚠️  Database might still be starting up. Give it a few more seconds."
fi

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📝 Default admin credentials:"
echo "   Email: superadmin@basaeer.com"
echo "   Password: admin123"
echo ""
echo "To start the backend: cd backend && npm run start:dev"
echo "To start the frontend: cd frontend && npm run dev"
