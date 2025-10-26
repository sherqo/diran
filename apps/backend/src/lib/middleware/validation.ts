import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { validateData } from '@diran/shared';
import { ApiError } from './errorHandler';
import { HttpStatus, ErrorCode } from '@diran/shared/constants/errors';

export const validateRequest = ({
    bodySchema,
    paramsSchema,
    querySchema,
}: {
    bodySchema?: ZodSchema;
    paramsSchema?: ZodSchema;
    querySchema?: ZodSchema;
}) => {
    return (req: Request, _res: Response): void => {
        if (bodySchema) {
            const result = validateData(bodySchema, req.body);
            if (!result.success) {
                throw new ApiError(result.error.message, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
            }
            req.body = result.data;
        }

        if (paramsSchema) {
            const result = validateData(paramsSchema, req.params);
            if (!result.success) {
                throw new ApiError(result.error.message, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
            }
            req.params = result.data as Record<string, string>;
        }

        if (querySchema) {
            const result = validateData(querySchema, req.query);
            if (!result.success) {
                throw new ApiError(result.error.message, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
            }
            req.query = result.data as Record<string, string>;
        }
    };
};
