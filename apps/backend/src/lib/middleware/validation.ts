import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { validateData } from '@diran/shared/lib/validation';
import { ApiError } from './errorHandler';
import { HttpStatus, ErrorCode } from '@diran/shared/constants/errors';

export const validateRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = validateData(schema, req.body);

        if (!result.success) {
            // Create a detailed validation error message
            const errorMessage = `Validation failed: ${result.message}`;
            throw new ApiError(errorMessage, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        req.body = result.data;
        next();
    };
};
