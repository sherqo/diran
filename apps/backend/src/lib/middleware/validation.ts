import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { validateData } from '@diran/shared';
import { ApiError } from './errorHandler';
import { HttpStatus, ErrorCode } from '@diran/shared/constants/errors';

export const validateRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        console.log('🔥 BACKEND VALIDATION MIDDLEWARE:');
        console.log('🛣️  Route:', req.method, req.path);
        console.log('📨 Request body:', JSON.stringify(req.body, null, 2));
        console.log('📋 Schema name:', schema.constructor.name);

        const result = validateData(schema, req.body);

        if (!result.success) {
            console.log('💥 Validation failed in middleware:', result.error.message);
            // Use the formatted error message from validation
            throw new ApiError(result.error.message, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        console.log('✅ Middleware validation passed');
        req.body = result.data;
        next();
    };
};
