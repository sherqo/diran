import { z } from 'zod';
import { ApiResult } from '../types/api';
import { ErrorCode } from '../constants/errors';

/**
 * Validates data against a Zod schema and returns ApiResult format
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): ApiResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  // Format Zod errors into a readable error message
  const errors: string[] = [];

  for (const issue of result.error.issues) {
    errors.push(`${issue.message}`);
  }

  const errorMessage = errors[0];

  return {
    success: false,
    error: {
      message: errorMessage,
      code: ErrorCode.VALIDATION_ERROR,
    },
  };
}
