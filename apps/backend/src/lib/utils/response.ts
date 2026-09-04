import type { ErrorResponse, SuccessResponse } from '@diran/shared/types/api.js';
import { FastifyReply } from 'fastify';

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse<T>;

// Helper to send success responses
export const sendSuccess = <T>(reply: FastifyReply, data: T, message?: string, statusCode: number = 200): FastifyReply => {
    const response: SuccessResponse<T> = {
        success: true,
        data,
        ...(message && { message }),
    };

    return reply.status(statusCode).send(response);
};

// Helper to send error responses
export const sendError = <T = any>(
    reply: FastifyReply,
    message: string,
    statusCode: number = 500,
    code?: string,
    data?: T,
    details?: string[]
): FastifyReply => {
    const response: ErrorResponse<T> = {
        success: false,
        error: {
            message,
            ...(code && { code }),
            ...(details && { details }),
        },
        ...(data !== undefined && { data }),
    };

    return reply.status(statusCode).send(response);
};
