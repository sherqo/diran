import type { ErrorResponse, SuccessResponse } from '@diran/shared/types/api';
import { Response } from 'express';

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse<T>;

// Helper to send success responses
export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode: number = 200): Response<SuccessResponse<T>> => {
    const response: SuccessResponse<T> = {
        success: true,
        data,
        ...(message && { message }),
    };

    return res.status(statusCode).json(response);
};

// Helper to send error responses
export const sendError = <T = any>(
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string,
    data?: T,
    details?: string[]
): Response<ErrorResponse<T>> => {
    const response: ErrorResponse<T> = {
        success: false,
        error: {
            message,
            ...(code && { code }),
            ...(details && { details }),
        },
        ...(data !== undefined && { data }),
    };

    return res.status(statusCode).json(response);
};
