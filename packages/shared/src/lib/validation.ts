import { z } from 'zod';
import { ApiResult } from '../types/api';
import { ErrorCode } from '../constants/errors';

/**
 * Validates data against a Zod schema and returns ApiResult format
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): ApiResult<T> {
  // Debug logging
  console.log('🔍 VALIDATION DEBUG:');
  console.log('📊 Schema:', schema._def);
  console.log('📦 Data received:', JSON.stringify(data, null, 2));
  console.log('🔢 Data type:', typeof data);

  const result = schema.safeParse(data);

  if (result.success) {
    console.log('✅ Validation successful');
    return {
      success: true,
      data: result.data,
    };
  }

  console.log('❌ Validation failed:');
  console.log('🐛 Zod error:', JSON.stringify(result.error.issues, null, 2));

  // Format Zod errors into a readable error message
  const errors: string[] = [];

  for (const issue of result.error.issues) {
    const field = issue.path.length > 0 ? issue.path.join('.') : 'unknown';
    errors.push(`${field}: ${issue.message}`);
  }

  // const errorMessage = errors.length === 1 ? errors[0] : `Multiple validation errors: ${errors.join(', ')}`;
  const errorMessage = errors[0];

  return {
    success: false,
    error: {
      message: errorMessage,
      code: ErrorCode.VALIDATION_ERROR,
    },
  };
}
