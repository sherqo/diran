# 🚀 Getting Started - Complete Beginner Guide

## What is this app?

This is a **backend API** - it's like the engine of a car. Your frontend (website/mobile app) talks to this backend to:

- Register new users
- Login users
- Store user data
- Reset passwords

Think of it as a waiter in a restaurant - your frontend orders food (makes requests), and the backend serves the food (sends responses).

## What is PostgreSQL?

PostgreSQL is a **database** - like a digital filing cabinet that stores all your user information (emails, passwords, names, etc.) safely and organized.

## 🎯 Quick Test (5 minutes)

### Step 1: Get a Free Database (No Installation Needed!)

1. Go to **Railway.app** or **Supabase.com** (both free)
2. Sign up with GitHub
3. Create a new PostgreSQL database
4. Copy the connection string (looks like: `postgresql://user:pass@host:5432/dbname`)

### Step 2: Setup Your Environment

1. Open the `.env` file
2. Replace the DATABASE_URL with your connection string:
    ```
    DATABASE_URL="your-connection-string-here"
    ```

### Step 3: Install and Run

```bash
# Install everything
npm install

# Setup database tables
npm run migrate

# Generate database client
npm run generate

# Start the server
npm run dev
```

### Step 4: Test It!

Open your browser and go to: `http://localhost:3000/api/health`

You should see:

```json
{
    "database": "connected",
    "status": "ok",
    "timestamp": "2025-10-09T...",
    "uptime": 123.456
}
```

## 🧪 Testing Your API

### Test 1: Create a User

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Test 2: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

This will give you a **token** - copy it!

### Test 3: Get Profile (Protected Route)

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🌐 For Internet Deployment

### Easy Options:

1. **Railway.app** - Connect your GitHub repo, it deploys automatically
2. **Render.com** - Same thing, very easy
3. **Vercel** - Good for Node.js apps

### What you need:

- Your GitHub repo (which you have)
- A PostgreSQL database (Railway/Supabase provides this)
- Environment variables set on the platform

## 🔧 Real Environment Variables

For production, change these in your `.env`:

```env
# Strong JWT secret (use a password generator)
JWT_SECRET=use-a-really-long-random-string-here-at-least-32-characters

# Production database URL
DATABASE_URL=your-production-database-url

# Production settings
NODE_ENV=production
PORT=3000

# If you want email resets (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

## ❓ Common Issues

**"Module not found"** → Run `npm install`
**"Database connection failed"** → Check your DATABASE_URL
**"Port already in use"** → Change PORT to 3001 in .env

## 🎮 What Can You Build With This?

- User registration/login system
- Mobile app backend
- Website user accounts
- Any app that needs users!

The frontend (React, Vue, mobile app) would call these endpoints to manage users.

## Need Help?

1. Check the terminal for error messages
2. Make sure PostgreSQL database is running
3. Verify your .env file has the right DATABASE_URL
4. Try the health check endpoint first: `http://localhost:3000/api/health`
