import type { RateLimitPluginOptions } from '@fastify/rate-limit';

export const globalRateLimiterConfig: RateLimitPluginOptions = {
    max: 200,
    timeWindow: '1 minute',
};

export const healthCheckRateLimiterConfig: RateLimitPluginOptions = {
    max: 60,
    timeWindow: '60 minutes',
} as RateLimitPluginOptions;

// Stricter rate limiters for auth endpoints to prevent abuse
export const authRateLimiters = {
    login: {
        max: 10,
        timeWindow: '1 hour',
    } as RateLimitPluginOptions,

    resetPassword: {
        max: 3,
        timeWindow: '1 hour',
    } as RateLimitPluginOptions,

    resendOTP: {
        max: 2,
        timeWindow: '1 hour',
    } as RateLimitPluginOptions,

    otp: {
        max: 5,
        timeWindow: '1 hour',
    } as RateLimitPluginOptions,
};

export const profileRateLimiter = {
    updateProfile: {
        max: 3,
        timeWindow: '1 minute',
    } as RateLimitPluginOptions,

    changePassword: {
        max: 2,
        timeWindow: '1 minute',
    } as RateLimitPluginOptions,

    bigWindow: {
        max: 10,
        timeWindow: '1 hour',
    } as RateLimitPluginOptions,
};
