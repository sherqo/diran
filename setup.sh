#!/bin/bash

echo "🚀 Diran AI Backend - Quick Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if we have a database URL
if ! grep -q "postgresql://" .env 2>/dev/null; then
    echo ""
    echo "⚠️  You need a PostgreSQL database!"
    echo ""
    echo "🌐 Quick Options (FREE):"
    echo "1. Railway.app - Sign up, create PostgreSQL, copy connection string"
    echo "2. Supabase.com - Sign up, create project, go to Settings > Database"
    echo "3. Neon.tech - Sign up, create database, copy connection string"
    echo ""
    echo "📝 Then paste the connection string in your .env file:"
    echo "   DATABASE_URL=\"postgresql://user:pass@host:5432/dbname\""
    echo ""
    echo "💡 Or for local PostgreSQL:"
    echo "   1. Install PostgreSQL on your computer"
    echo "   2. Create a database called 'diran_ai_backend'"
    echo "   3. Update .env with your local connection"
    echo ""
    read -p "Press Enter when you've set up your database URL..."
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🗄️  Setting up database..."
npm run generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated"
else
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

npm run migrate

if [ $? -eq 0 ]; then
    echo "✅ Database migrations complete"
else
    echo "❌ Database migration failed. Check your DATABASE_URL in .env"
    exit 1
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "🚀 To start your server:"
echo "   npm run dev"
echo ""
echo "🧪 To test your API:"
echo "   1. Run: npm run dev"
echo "   2. Open: test-ui.html in your browser"
echo "   3. Or run: ./test-api.sh"
echo ""
echo "📊 Your API will be at: http://localhost:3000"
echo "🏥 Health check: http://localhost:3000/api/health"
echo ""
echo "💡 Need help? Read GETTING_STARTED.md"