import React from 'react';
import { z } from 'zod';
import { validateData, ValidationResult } from '@/shared/lib/validation';

/**
 * React hook for form validation using Zod schemas
 */
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const validate = (data: unknown) => {
        const result = validateData(schema, data);

        if (!result.success) {
            setErrors(result.errors);
        } else {
            setErrors({});
        }

        return result;
    };

    const clearErrors = () => setErrors({});

    const clearFieldError = (field: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    return {
        errors,
        validate,
        clearErrors,
        clearFieldError,
        hasErrors: Object.keys(errors).length > 0,
    };
}
