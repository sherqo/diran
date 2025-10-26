# @app/shared

Shared types, validation schemas, and constants used across the frontend and backend.

## What's included

- **Types**: API response types, User types, Auth types
- **Validation**: Zod schemas for auth and user operations
- **Constants**: Error codes and HTTP status enums

## Usage

```typescript
// Import types
import type { User, ApiResult, SuccessResponse } from '@app/shared';

// Import validation schemas
import { signupBodySchema, loginBodySchema } from '@app/shared';

// Import constants
import { ErrorCode, HttpStatus } from '@app/shared';
```

## Development

```bash
# Build the package
bun run build

# Watch for changes during development
bun run dev
```

## Files

- `src/types/` - TypeScript interfaces and types
- `src/validation/` - Zod validation schemas
- `src/constants/` - Enums and constants
- `src/index.ts` - Main export file
