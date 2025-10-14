import { z } from 'zod';

export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: Record<string, string>;
      message: string;
    };

/**
 * Validates data against a Zod schema and returns formatted errors
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  // Format Zod errors into a more usable format
  const errors: Record<string, string> = {};
  let firstError = '';

  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    const field = path || 'root';

    if (!errors[field]) {
      errors[field] = issue.message;
      if (!firstError) {
        firstError = issue.message;
      }
    }
  }

  return {
    success: false,
    errors,
    message: firstError || 'Validation failed',
  };
}

/**
 * Validates a single field against a Zod schema
 */
export function validateField<T>(schema: z.ZodSchema<T>, value: unknown): string | null {
  const result = schema.safeParse(value);
  return result.success ? null : result.error.issues[0]?.message || 'Invalid value';
}
