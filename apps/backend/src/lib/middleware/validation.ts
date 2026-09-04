import { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { ZodSchema } from 'zod';
import { validateData } from '@diran/shared';
import { ApiError } from './errorHandler';
import { HttpStatus, ErrorCode } from '@diran/shared/constants/errors.js';

export const validateRequest = ({
    bodySchema,
    paramsSchema,
    querySchema,
}: {
    bodySchema?: ZodSchema;
    paramsSchema?: ZodSchema;
    querySchema?: ZodSchema;
}): preHandlerHookHandler => {
    return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
        if (paramsSchema) {
            const result = validateData(paramsSchema, request.params);
            if (!result.success) {
                throw new ApiError(
                    result.error.message,
                    HttpStatus.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                    undefined,
                    result.error.details
                );
            }
            request.params = result.data as Record<string, string>;
        }

        if (querySchema) {
            const result = validateData(querySchema, request.query);
            if (!result.success) {
                throw new ApiError(
                    result.error.message,
                    HttpStatus.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                    undefined,
                    result.error.details
                );
            }
            request.query = result.data as Record<string, string>;
        }

        if (bodySchema) {
            const result = validateData(bodySchema, request.body);
            if (!result.success) {
                throw new ApiError(
                    result.error.message,
                    HttpStatus.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                    undefined,
                    result.error.details
                );
            }
            request.body = result.data;
        }
    };
};
