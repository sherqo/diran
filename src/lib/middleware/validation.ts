import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendValidationError } from '#lib/utils/response';

export const validateRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const validated = schema.parse(req.body);
            req.body = validated;
            next();
        } catch (error: any) {
            sendValidationError(res, error.errors || error.message);
        }
    };
};
