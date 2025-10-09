import { sendError } from '#lib/utils/response';
import { Request, Response, NextFunction } from 'express';
import { ErrorCode, HttpStatus } from '#lib/constants/errors';

// Custom error class for API errors
export class ApiError extends Error {
    public status: number;
    public code?: string;
    public details?: any;

    constructor(message: string, status: number = 500, code?: string, details?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        if (code) this.code = code;
        if (details) this.details = details;
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
        sendError(res, error.message, error.status, error.code, error.details);
        return;
    }

    // Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
        const message = isProduction ? 'Database error' : error.message;
        sendError(res, message, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.DATABASE_ERROR, !isProduction ? error : undefined);
        return;
    }

    // Validation errors (Zod)
    if (error.name === 'ZodError') {
        sendError(res, 'Validation failed', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, !isProduction ? error.errors : undefined);
        return;
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        const message = isProduction ? 'Authentication failed' : 'Invalid token';
        sendError(res, message, HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN, !isProduction ? error : undefined);
        return;
    }

    if (error.name === 'TokenExpiredError') {
        const message = isProduction ? 'Authentication failed' : 'Token expired';
        sendError(res, message, HttpStatus.UNAUTHORIZED, ErrorCode.TOKEN_EXPIRED, !isProduction ? error : undefined);
        return;
    }

    // Generic errors
    const message = isProduction ? 'Internal server error' : error.message;
    const details = !isProduction ? { stack: error.stack, name: error.name } : undefined;

    sendError(res, message, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, details);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
    sendError(res, 'Route not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
};

// Async error wrapper to catch async errors in route handlers
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
