# 🏗️ Project Architecture & Module Guide

## 📁 Clean Modular Structure

```
src/
├── modules/                 # Feature modules (main business logic)
│   ├── auth/               # Authentication module
│   │   ├── controller.ts   # Auth business logic
│   │   ├── routes.ts       # Auth API endpoints
│   │   ├── validation.ts   # Auth input validation
│   │   └── index.ts        # Module exports
│   ├── user/               # User management module
│   │   ├── controller.ts   # User business logic
│   │   ├── routes.ts       # User API endpoints
│   │   └── index.ts        # Module exports
│   └── example/            # Example module (template)
│       ├── controller.ts   # Example business logic
│       ├── routes.ts       # Example API endpoints
│       ├── validation.ts   # Example input validation
│       └── index.ts        # Module exports
├── shared/                 # Shared utilities and middleware
│   ├── database/           # Database connection and utilities
│   │   ├── connection.ts   # Prisma client setup
│   │   └── index.ts        # Database exports
│   ├── middleware/         # Reusable middleware
│   │   ├── auth.ts         # JWT authentication middleware
│   │   ├── validation.ts   # Request validation middleware
│   │   └── index.ts        # Middleware exports
│   ├── utils/              # Utility functions
│   │   ├── auth.ts         # Auth utilities (JWT, hashing)
│   │   └── index.ts        # Utils exports
│   ├── types/              # TypeScript type definitions
│   │   ├── api.ts          # API response types
│   │   └── index.ts        # Types exports
│   └── routes/             # Shared routes (health checks)
│       └── health.ts       # Health check endpoint
└── server.ts               # Main application entry point
```

## 🎯 Design Principles

### 1. **Modular by Feature**

- Each feature is a self-contained module
- Easy to add, remove, or modify modules
- Clear separation of concerns

### 2. **Shared Resources**

- Common utilities in `/shared`
- Reusable middleware and types
- Single database connection

### 3. **Clean Naming**

- Simple, descriptive names
- No unnecessary abbreviations
- Consistent naming patterns

### 4. **Scalable Structure**

- Easy to add new modules
- Each module follows the same pattern
- Minimal interdependencies

## 🔧 How to Add a New Module

### Step 1: Create Module Directory

```bash
mkdir src/modules/your-module
```

### Step 2: Create Module Files

```
src/modules/your-module/
├── validation.ts    # Zod schemas for input validation
├── controller.ts    # Business logic and database operations
├── routes.ts        # API endpoints and middleware
└── index.ts         # Module exports
```

### Step 3: Follow the Pattern

**validation.ts**

```typescript
import { z } from 'zod';

export const createItemSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
```

**controller.ts**

```typescript
import { Request, Response } from 'express';
import { db } from '../../shared/database/index.js';
import { AuthenticatedRequest } from '../../shared/middleware/index.js';

export const createItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // Your business logic here
        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            data: {
                /* your data */
            },
        });
    } catch (error: any) {
        console.error('Create item error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
```

**routes.ts**

```typescript
import { Router } from 'express';
import { createItem } from './controller.js';
import { authenticate, validateRequest } from '../../shared/middleware/index.js';
import { createItemSchema } from './validation.js';

const router = Router();

router.use(authenticate); // If authentication required
router.post('/', validateRequest(createItemSchema), createItem);

export default router;
```

**index.ts**

```typescript
export * from './controller.js';
export * from './validation.js';
export { default as yourModuleRoutes } from './routes.js';
```

### Step 4: Add Route to Main Server

In `src/server.ts`:

```typescript
import { yourModuleRoutes } from './modules/your-module/index.js';

// Add your route
app.use('/api/your-module', yourModuleRoutes);
```

## 🚀 Current API Endpoints

### Health Check

- `GET /api/health` - Check API and database status

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Management

- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update user profile (protected)
- `POST /api/user/change-password` - Change password (protected)

### Example Module (for reference)

- `POST /api/example` - Create example (protected)
- `GET /api/example` - Get examples (protected)

## 🔧 Available Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run migrate      # Run database migrations
bun run generate     # Generate Prisma client
bun run studio       # Open database GUI
bun run test-db      # Test database connection
```

## 💡 Best Practices

1. **Keep modules independent** - Avoid cross-module imports
2. **Use shared utilities** - Don't duplicate code
3. **Validate all inputs** - Use Zod schemas
4. **Handle errors properly** - Always try/catch
5. **Use TypeScript** - Type everything
6. **Follow naming conventions** - Be consistent

**Your backend is now production-ready and highly scalable!**
