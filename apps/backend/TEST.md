# Testing Guide

## Setup

1. **Create test database:**

    ```bash
    # Make sure you have a separate test database
    # Update .env.test with your test database credentials
    ```

2. **Install dependencies** (if not done):
    ```bash
    bun install
    ```

## Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage
```

## Test Structure

```
test/
├── setup.ts                    # Global test setup
├── helpers/
│   ├── server.ts              # Test server factory
│   ├── database.ts            # Database utilities
│   └── auth.ts                # Authentication utilities
└── integration/
    ├── auth.test.ts           # Auth routes tests
    ├── user.test.ts           # User routes tests
    ├── block.test.ts          # Block routes tests
    └── health.test.ts         # Health check tests
```

## Writing Tests

### Example Test Structure

```typescript
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { createTestServer } from '../helpers/server.js';
import { clearDatabase } from '../helpers/database.js';

describe('Your Feature', () => {
    let app;

    beforeAll(async () => {
        app = await createTestServer();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    test('should do something', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/v1/your-route',
        });

        expect(response.statusCode).toBe(200);
    });
});
```

## Test Utilities

### Database Helpers

```typescript
import { clearDatabase, createTestUser, createTestBlock } from '../helpers/database.js';

// Clear all test data
await clearDatabase();

// Create test user
const user = await createTestUser({ email: 'test@example.com' });

// Create test block
const block = await createTestBlock(user.id);
```

### Authentication Helpers

```typescript
import { createAuthenticatedUser, getAuthHeader } from '../helpers/auth.js';

// Create authenticated user and get cookies
const { user, cookies } = await createAuthenticatedUser(app);

// Use in requests
const response = await app.inject({
    method: 'GET',
    url: '/v1/users/profile',
    headers: getAuthHeader(cookies),
});
```

## Coverage

Coverage reports are generated in the `coverage/` directory.

- **Text**: Displayed in terminal
- **HTML**: Open `coverage/index.html` in browser
- **LCOV**: For CI/CD integration

## CI/CD Integration

Add to your GitHub Actions or CI pipeline:

```yaml
- name: Run tests
  run: bun test

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
      files: ./coverage/lcov.info
```
