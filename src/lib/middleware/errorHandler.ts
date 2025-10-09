import { Request, Response, NextFunction } from 'express';
import { sendInternalError } from '../../lib/utils/response.js';

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
        // Custom API errors
        sendInternalError(res, error.message, error.details);
        return;
    }

    // Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
        const message = isProduction ? 'Database error' : error.message;
        sendInternalError(res, message, !isProduction ? error : undefined);
        return;
    }

    // Validation errors (Zod)
    if (error.name === 'ZodError') {
        const message = 'Validation failed';
        const details = !isProduction ? error.errors : undefined;
        sendInternalError(res, message, details);
        return;
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        const message = isProduction ? 'Authentication failed' : error.message;
        sendInternalError(res, message, !isProduction ? error : undefined);
        return;
    }

    // Generic errors
    const message = isProduction ? 'Internal server error' : error.message;
    const details = !isProduction ? { stack: error.stack, name: error.name } : undefined;

    sendInternalError(res, message, details);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
    sendInternalError(res, 'Route not found', undefined);
};

// Async error wrapper to catch async errors in route handlers
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
