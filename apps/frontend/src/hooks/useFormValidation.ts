import React from 'react';
import { z } from 'zod';
import { validateData } from '@/shared/lib/validation';
import { ApiResult } from '@/shared/types/api';

/**
 * React hook for form validation using Zod schemas
 * Returns consistent ApiResult format
 */
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
    const [errorMessage, setErrorMessage] = React.useState<string>('');

    const validate = (data: unknown): ApiResult<T> => {
        const result = validateData(schema, data);

        if (!result.success) {
            setErrorMessage(result.error.message);
        } else {
            setErrorMessage('');
        }

        return result;
    };

    const clearErrors = () => setErrorMessage('');

    const clearFieldError = () => setErrorMessage(''); // Simplified since we only have one error message

    return {
        errorMessage,
        validate,
        clearErrors,
        clearFieldError,
        hasErrors: errorMessage.length > 0,
    };
}
