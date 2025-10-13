# Project Structure Guide

## 📁 Clean & Scalable Architecture

This project uses a modular architecture that's easy to understand and scale:

```
src/
├── modules/              # Feature modules
│   ├── auth/            # Authentication module
│   │   ├── controller.ts    # Auth business logic
│   │   ├── routes.ts        # Auth API routes
│   │   ├── validation.ts    # Auth input validation
│   │   └── index.ts         # Module exports
│   ├── user/            # User management module
│   │   ├── controller.ts    # User business logic
│   │   ├── routes.ts        # User API routes
│   │   └── index.ts         # Module exports
│   └── index.ts         # All modules export
├── shared/              # Shared utilities
│   ├── database/        # Database connection
│   ├── middleware/      # Common middleware
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript types
│   └── routes/         # Global routes (health)
└── server.ts           # Main application entry
```

## 🎯 Adding New Features

### To add a new module (e.g., "posts"):

1. **Create module folder:**

    ```bash
    mkdir src/modules/posts
    ```

2. **Create module files:**
    - `controller.ts` - Business logic
    - `routes.ts` - API endpoints
    - `validation.ts` - Input validation
    - `index.ts` - Module exports

3. **Add to main modules index:**

    ```typescript
    // src/modules/index.ts
    export * from './posts/index.js';
    ```

4. **Register routes in server.ts:**
    ```typescript
    import { postsRoutes } from './modules/index.js';
    app.use('/api/posts', postsRoutes);
    ```

### Example new module structure:

```
src/modules/posts/
├── controller.ts       # createPost, getPosts, updatePost, deletePost
├── routes.ts          # POST /api/posts, GET /api/posts, etc.
├── validation.ts      # createPostSchema, updatePostSchema
└── index.ts          # export * from './controller.js'
```

## 🗄️ Database Schema Changes

### To add new database tables:

1. **Update Prisma schema:**

    ```prisma
    // prisma/schema.prisma
    model Post {
      id        String   @id @default(cuid())
      title     String
      content   String
      userId    String
      user      User     @relation(fields: [userId], references: [id])
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
    }
    ```

2. **Generate migration:**

    ```bash
    bun run migrate
    ```

3. **Update types:**
    ```bash
    bun run generate
    ```

## 🔧 Current API Endpoints

### Authentication (`/api/auth/`)

- `POST /signup` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

### User Management (`/api/user/`)

- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /change-password` - Change password

### System (`/api/health/`)

- `GET /` - Health check

## 📝 Naming Conventions

- **Files:** `kebab-case` (controller.ts, validation.ts)
- **Functions:** `camelCase` (getProfile, createUser)
- **Variables:** `camelCase` (userData, isValid)
- **Constants:** `UPPER_SNAKE_CASE` (JWT_SECRET, PORT)
- **Types:** `PascalCase` (SignupInput, UserData)

## 🎨 Code Style

- **No complex logic in routes** - Keep routes thin, logic in controllers
- **Validate all inputs** - Use Zod schemas for validation
- **Handle errors gracefully** - Always return proper error responses
- **Use TypeScript strictly** - No `any` types unless necessary
- **Keep functions small** - Single responsibility principle

## 🚀 Ready for Scale

This structure supports:

- ✅ **Multiple features** - Easy to add new modules
- ✅ **Team development** - Clear separation of concerns
- ✅ **Testing** - Each module can be tested independently
- ✅ **Maintenance** - Find and fix issues quickly
- ✅ **API versioning** - Can add `/api/v2/` easily
