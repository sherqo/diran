import { sendError } from '#lib/utils/response';
import { Request, Response, NextFunction } from 'express';
import { isDevelopment } from '#lib/utils/common';
import { HttpStatus, ErrorCode } from '@diran/shared/constants/errors';
import { Prisma } from '@prisma/client';

// Custom error class for API errors
export class ApiError extends Error {
    public status: number;
    public code?: string;
    public data?: any;
    public details?: string[];

    constructor(message: string, status: number = 500, code?: string, data?: any, details?: string[]) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        if (code) this.code = code;
        if (data) this.data = data;
        if (details) this.details = details;
    }
}

// Error handling middleware
export const errorHandler = (error: any, _req: Request, res: Response, _next: NextFunction): void => {
    // Log the error (always log in development, minimal in production)
    if (isDevelopment) {
        console.error('🚨 API Error:', {
            message: error.message,
            time: new Date().toISOString(),
            stack: error.stack,
            name: error.name,
            url: _req.url,
            method: _req.method,
            body: _req.body,
        });
    } else {
        console.error('🚨 API Error:', { message: error.message, time: new Date().toISOString() });
    }

    // Handle different error types
    if (error instanceof ApiError) {
        // Custom API errors - use proper response utility based on status
        sendError(res, error.message, error.status, error.code, error.data, error.details);
        return;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return handlePrismaError(error, _req, res, _next);
    }

    // Validation errors (Zod)
    if (error.name === 'ZodError') {
        sendError(res, error.errors, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
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

    // Timeout errors
    if (error.code === 'ETIMEDOUT' || error.message === 'Request timeout') {
        sendError(res, 'Request timeout, please try again later', HttpStatus.REQUEST_TIMEOUT, ErrorCode.TIMEOUT);
        return;
    }

    if (error instanceof SyntaxError && 'body' in error) {
        sendError(res, 'Invalid JSON', HttpStatus.BAD_REQUEST, ErrorCode.INVALID_JSON);
        return;
    }

    // Generic errors
    sendError(res, 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
};

// Map a Prisma error code prefix / exact code to status + message
const prismaErrorMap: Record<string, { status: number; code: string; message: string }> = {
    // Unique constraint violation
    P2002: { status: HttpStatus.CONFLICT, code: ErrorCode.DUPLICATE_RESOURCE, message: 'Duplicate value violates unique constraint' },
    // Foreign key violation
    P2003: { status: HttpStatus.BAD_REQUEST, code: ErrorCode.INVALID_INPUT, message: 'Foreign key constraint failed' },
    // Record not found
    P2025: { status: HttpStatus.NOT_FOUND, code: ErrorCode.NOT_FOUND, message: 'Record not found' },
    // Invalid ID / argument
    P2014: { status: HttpStatus.BAD_REQUEST, code: ErrorCode.INVALID_INPUT, message: 'Invalid ID or relation' },
    // Generic known request error fallback
    // etc — include more as needed
};

export function handlePrismaError(error: unknown, req: Request, res: Response, next: NextFunction): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const meta = (error.meta ?? {}) as any;
        const target = Array.isArray(meta.target) ? meta.target.join(', ') : meta.field_name || 'unknown field';

        const entry = prismaErrorMap[error.code] || {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            code: ErrorCode.DATABASE_ERROR,
            message: `Database error (${error.code}) on ${target}`,
        };

        // Log in dev
        if (isDevelopment) {
            console.error('Prisma error details:', { code: error.code, target, meta, stack: error.stack });
        }

        sendError(res, entry.message, entry.status, entry.code);
        return;
    }
    // Not a PrismaClientKnownRequestError → pass through
    next(error);
}

// 404 handler
export const notFoundHandler = (_req: Request, res: Response): void => {
    sendError(res, 'Route not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
};
