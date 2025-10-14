# Diran AI Backend

A complete backend API built with Express.js, TypeScript, PostgreSQL, and Prisma ORM. Features JWT authentication and user management.

## 🚀 Features

- **TypeScript & ESM Modules**: Modern JavaScript/TypeScript development
- **Express.js**: Fast, unopinionated web framework
- **PostgreSQL with Prisma ORM**: Type-safe database operations
- **JWT Authentication**: Secure user authentication with JSON Web Tokens
- **Validation**: Request validation using Zod schemas
- **Security**: CORS, Helmet, password hashing with bcryptjs
- **Health Checks**: API health monitoring endpoint

## 📁 Project Structure

```
src/
├── controllers/     # Request handlers
├── middlewares/     # Custom middleware functions
├── models/         # Database connection and models
├── routes/         # API route definitions
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── server.ts       # Main application entry point

prisma/
└── schema.prisma   # Database schema definition
```

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (or Docker)

### Local Development Setup

1. **Install dependencies:**

    ```bash
    npm install
    ```

2. **Environment Configuration:**

    ```bash
    cp .env.example .env
    # Edit .env with your database credentials and JWT secret
    ```

3. **Database Setup:**

    ```bash
    # Make sure PostgreSQL is running locally
    # Update DATABASE_URL in .env with your PostgreSQL credentials
    npm run migrate
    npm run generate
    ```

4. **Start Development Server:**

    ```bash
    npm run dev
    ```

The API will be available at `http://localhost:3000`

## 📚 API Endpoints

### Health Check

```
GET /api/health
```

### Authentication

```
POST /api/auth/signup      # User registration
POST /api/auth/login       # User login
POST /api/auth/logout      # User logout (authenticated)
POST /api/auth/forgot-password    # Request password reset
POST /api/auth/reset-password     # Reset password with token
```

### User Profile (Authenticated)

```
GET /api/auth/profile            # Get user profile
PUT /api/auth/profile            # Update user profile
POST /api/auth/change-password   # Change password
```

### Example Requests

**User Signup:**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

**User Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Access Protected Route:**

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🗄️ Database Schema

### User Model

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  photo     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  resetPasswordToken   String?
  resetPasswordExpires DateTime?
}
```

## 🔧 Scripts

```bash
npm run dev        # Start development server with hot reload
npm run build      # Build for production
npm run start      # Start production server
npm run migrate    # Run database migrations
npm run generate   # Generate Prisma client
npm run studio     # Open Prisma Studio (database GUI)
```

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/diran_ai_backend"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@diranai.com

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🔒 Security Features

- **Password Hashing**: Using bcryptjs with salt rounds
- **JWT Tokens**: Secure authentication with configurable expiration
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet.js**: Sets various HTTP headers for security
- **Input Validation**: Zod schemas for request validation
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## 🚀 Production Deployment

1. **Set Environment Variables:**
    - Set strong JWT_SECRET
    - Configure production database URL
    - Set NODE_ENV=production

2. **Deploy manually:**

    ```bash
    npm run build
    npm run migrate
    npm start
    ```

## 🧪 Testing the API

Use the health endpoint to verify the API is running:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
    "database": "connected",
    "status": "ok",
    "timestamp": "2025-01-09T10:30:00.000Z",
    "uptime": 123.456
}
```

## 📖 Additional Notes

- The API uses ESM modules (import/export syntax)
- TypeScript is configured with strict mode enabled
- Prisma generates type-safe database client
- JWT tokens should be sent in Authorization header as "Bearer TOKEN"
- Password reset functionality logs tokens to console (implement email service in production)

## 🛟 Troubleshooting

**Database Connection Issues:**

- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists and migrations are run

**TypeScript Errors:**

- Run `npm run generate` to update Prisma client types
- Check tsconfig.json configuration

**Build Issues:**

- Run `npm run build` to check for TypeScript compilation errors

## 📄 License

This project is part of the Diran AI platform.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.22. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
