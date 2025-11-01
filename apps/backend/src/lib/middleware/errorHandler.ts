import { sendError } from '#lib/utils/response';
import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
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

// Error handling middleware for Fastify
export const errorHandler = (error: FastifyError | any, request: FastifyRequest, reply: FastifyReply): void => {
    // Log the error (always log in development, minimal in production)
    if (isDevelopment) {
        console.error('🚨 API Error:', {
            message: error.message,
            time: new Date().toISOString(),
            stack: error.stack,
            name: error.name,
            url: request.url,
            method: request.method,
            body: request.body,
        });
    } else {
        console.error('🚨 API Error:', { message: error.message, time: new Date().toISOString() });
    }

    // Handle different error types
    if (error instanceof ApiError) {
        // Custom API errors - use proper response utility based on status
        sendError(reply, error.message, error.status, error.code, error.data, error.details);
        return;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, request, reply);
        return;
    }

    // Validation errors (Zod)
    if (error.name === 'ZodError') {
        const details = error.errors?.map((err: any) => `${err.path.join('.')}: ${err.message}`) || [];
        sendError(reply, 'Validation error', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, undefined, details);
        return;
    }

    // Fastify validation errors (from Zod type provider)
    if (error.validation) {
        const details = error.validation.map((err: any) => {
            const path = err.instancePath?.replace(/^\//, '').replace(/\//g, '.') || err.params?.issue?.path?.join('.') || 'unknown';
            return `${path}: ${err.message}`;
        });
        sendError(reply, 'Validation error', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, undefined, details);
        return;
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        sendError(reply, 'Invalid token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
        return;
    }

    if (error.name === 'TokenExpiredError') {
        sendError(reply, 'Token expired', HttpStatus.UNAUTHORIZED, ErrorCode.TOKEN_EXPIRED);
        return;
    }

    // Server under pressure
    if (error.name === 'FastifyError' && error.message === 'SERVER_NUKED') {
        sendError(reply, 'Server is under heavy load, try again later', HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.SERVER_OVERLOAD);
        return;
    }

    // Rate limit errors
    if (error.statusCode === 429 || error.code === 'FST_ERR_RATE_LIMIT') {
        sendError(reply, error.message, HttpStatus.TOO_MANY_REQUESTS, ErrorCode.TOO_MANY_REQUESTS);
        return;
    }

    // Timeout errors
    if (error.code === 'ETIMEDOUT' || error.message === 'Request timeout') {
        sendError(reply, 'Request timeout, please try again later', HttpStatus.REQUEST_TIMEOUT, ErrorCode.TIMEOUT);
        return;
    }

    // Parse errors from Fastify
    if (error.statusCode === 400 && error.message.includes('JSON')) {
        sendError(reply, 'Invalid JSON', HttpStatus.BAD_REQUEST, ErrorCode.INVALID_JSON);
        return;
    }

    // Generic errors
    sendError(reply, 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
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

export function handlePrismaError(error: Prisma.PrismaClientKnownRequestError, request: FastifyRequest, reply: FastifyReply): void {
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

    sendError(reply, entry.message, entry.status, entry.code);
}

// 404 handler for Fastify
export const notFoundHandler = (request: FastifyRequest, reply: FastifyReply): void => {
    sendError(reply, 'Route not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
};
