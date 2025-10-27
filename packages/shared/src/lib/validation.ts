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

  const details = result.error.issues.map(i => `${i.path.join('.') || 'root'}: ${i.message}`);

  return {
    success: false,
    error: {
      message: details[0], // dumb but keep it for backward compatibility
      code: ErrorCode.VALIDATION_ERROR,
      details,
    },
  };
}
