import { sendError } from '#lib/utils/response';
import { Request, Response, NextFunction } from 'express';
import { ErrorCode, HttpStatus } from '#lib/constants/errors';

// Custom error class for API errors
export class ApiError extends Error {
    public status: number;
    public code?: string;

    constructor(message: string, status: number = 500, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        if (code) this.code = code;
    }
}

// Error handling middleware
export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
    const isProduction = process.env.NODE_ENV === 'production';

    // Log the error (always log in development, minimal in production)
    if (!isProduction) {
        console.error('🚨 API Error:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            url: req.url,
            method: req.method,
            body: req.body,
        });
    } else {
        console.error('🚨 API Error:', error.message);
    }

    // Handle different error types
    if (error instanceof ApiError) {
        // Custom API errors - use proper response utility based on status
        sendError(res, error.message, error.status, error.code);
        return;
    }

    // Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
        sendError(res, 'Database error', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.DATABASE_ERROR);
        return;
    }

    // Validation errors (Zod)
    if (error.name === 'ZodError') {
        sendError(res, 'Validation failed', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        return;
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        sendError(res, 'Invalid token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
        return;
    }

    if (error.name === 'TokenExpiredError') {
        sendError(res, 'Token expired', HttpStatus.UNAUTHORIZED, ErrorCode.TOKEN_EXPIRED);
        return;
    }

    // Generic errors
    sendError(res, 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
    sendError(res, 'Route not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
};
