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
