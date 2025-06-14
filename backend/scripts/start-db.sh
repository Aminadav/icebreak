#!/bin/bash

echo "🐳 Starting PostgreSQL with Docker..."

# בדיקה אם Docker רץ
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# הפעלת מסד הנתונים
docker-compose up -d

echo "⏳ Waiting for PostgreSQL to be ready..."

# המתנה למסד הנתונים
until docker-compose exec postgres pg_isready -U icebreak_user -d icebreak_db > /dev/null 2>&1; do
    echo "⏳ Still waiting for database..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# הפעלת סקריפט יצירת הטבלאות
echo "🔧 Setting up database tables..."
npm run db:setup

echo "🎉 Database is ready to use!"
echo "📊 You can now run: npm run dev"
