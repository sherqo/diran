import { Response } from 'express';

// Standard API response types
export interface SuccessResponse<T = any> {
    success: true;
    data: T;
    message?: string;
}

export interface ErrorResponse {
    success: false;
    error: {
        message: string;
        code?: string;
        details?: any; // Only in development
    };
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

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
export const sendError = (
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any
): Response<ErrorResponse> => {
    const isProduction = process.env.NODE_ENV === 'production';

    const response: ErrorResponse = {
        success: false,
        error: {
            message,
            ...(code && { code }),
            // Only include details in development
            ...(!isProduction && details && { details }),
        },
    };

    return res.status(statusCode).json(response);
};

// Common error responses
export const sendInternalError = (res: Response, message = 'Internal server error', details?: any) =>
    sendError(res, message, 500, 'INTERNAL_ERROR', details);

export const sendValidationError = (res: Response, details?: any) => sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', details);

export const sendUnauthorized = (res: Response, message = 'Unauthorized') => sendError(res, message, 401, 'UNAUTHORIZED');

export const sendForbidden = (res: Response, message = 'Forbidden') => sendError(res, message, 403, 'FORBIDDEN');

export const sendNotFound = (res: Response, message = 'Resource not found') => sendError(res, message, 404, 'NOT_FOUND');

export const sendConflict = (res: Response, message = 'Resource already exists') => sendError(res, message, 409, 'CONFLICT');
