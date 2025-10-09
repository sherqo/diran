import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from './errorHandler';
import { ErrorCode, HttpStatus } from '#lib/constants/errors';

export const validateRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const validated = schema.parse(req.body);
            req.body = validated;
            next();
        } catch (error: any) {
            // Pass ApiError to error handler
            const apiError = new ApiError(
                'Validation failed',
                HttpStatus.BAD_REQUEST,
                ErrorCode.VALIDATION_ERROR,
                error.errors || error.message
            );
            next(apiError);
        }
    };
};
