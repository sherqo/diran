import { rateLimit } from 'express-rate-limit';
import ms from 'ms';

const responseMessage = { success: false, error: { message: 'Too many requests, please try again later.' } };

export const globalRateLimiter = rateLimit({
    windowMs: ms('1m'), // 1 minute
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 1 minute).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    message: responseMessage,
    // store: ... , // Redis, Memcached, etc. See below.
});

export const healthCheckRateLimiter = rateLimit({
    windowMs: ms('60m'), // 1 hour
    limit: 60, // Limit each IP to 60 requests per `window` (here, per 1 hour).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    message: responseMessage,
    // store: ... , // Redis, Memcached, etc. See below.
});

// Stricter rate limiters for auth endpoints to prevent abuse
export const authRateLimiters = {
    login: rateLimit({
        windowMs: ms('1h'), // 1 hour
        limit: 10, // 10 attempts per 1 hour
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: responseMessage,
    }),

    resetPassword: rateLimit({
        windowMs: ms('1h'), // 1 hour
        limit: 3, // 3 attempts per hour
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: responseMessage,
    }),

    resendOTP: rateLimit({
        windowMs: ms('1hr'), // 1 hour
        limit: 2, // 2 attempts per 1 hour
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: responseMessage,
    }),

    otp: rateLimit({
        windowMs: ms('1hr'), // 1 hour
        limit: 5, // 5 attempts per 1 hour
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: responseMessage,
    }),
};

export const profileRateLimiter = {
    updateProfile: rateLimit({
        windowMs: ms('1m'), // 1 minute
        limit: 3, // 3 requests per 1 minute
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: responseMessage,
    }),

    changePassword: rateLimit({
        windowMs: ms('1m'), // 1 minute
        limit: 2, // 2 requests per 1 minute
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: responseMessage,
    }),

    bigWindow: rateLimit({
        windowMs: ms('1h'), // 1 hour
        limit: 10, // 10 requests per 1 hour
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: responseMessage,
    }),
};
