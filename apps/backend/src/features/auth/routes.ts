import { FastifyInstance } from 'fastify';
import fastifyRateLimit from '@fastify/rate-limit';
import { validateRequest as vr } from '#lib/middleware/validation.js';
import { signup, login, forgotPassword, resetPassword, refresh, logout, verifyEmail, resendOTP } from './controller.js';
import { authRateLimiters as rl } from '#lib/middleware/rateLimiter.js';
import {
    forgotPasswordBodySchema,
    loginBodySchema,
    resendOTPBodySchema,
    resetPasswordBodySchema,
    signupBodySchema,
    verifyEmailBodySchema,
} from '@diran/shared/validation/auth.js';

export async function registerAuthRoutes(fastify: FastifyInstance): Promise<void> {
    // Fastify automatically handles async errors, no need for wrapper

    // Public routes with specific rate limiting
    fastify.post('/auth/refresh', {
        handler: refresh,
    });

    await fastify.register(async fastify => {
        await fastify.register(fastifyRateLimit, rl.login);
        fastify.post('/auth/signup', {
            preHandler: vr({ bodySchema: signupBodySchema }),
            handler: signup,
        });
        fastify.post('/auth/login', {
            preHandler: vr({ bodySchema: loginBodySchema }),
            handler: login,
        });
    });

    await fastify.register(async fastify => {
        await fastify.register(fastifyRateLimit, rl.resetPassword);
        fastify.post('/auth/forgot-password', {
            preHandler: vr({ bodySchema: forgotPasswordBodySchema }),
            handler: forgotPassword,
        });
        fastify.post('/auth/reset-password', {
            preHandler: vr({ bodySchema: resetPasswordBodySchema }),
            handler: resetPassword,
        });
    });

    await fastify.register(async fastify => {
        await fastify.register(fastifyRateLimit, rl.otp);
        fastify.post('/auth/verify-email', {
            preHandler: vr({ bodySchema: verifyEmailBodySchema }),
            handler: verifyEmail,
        });
    });

    await fastify.register(async fastify => {
        await fastify.register(fastifyRateLimit, rl.resendOTP);
        fastify.post('/auth/resend-otp', {
            preHandler: vr({ bodySchema: resendOTPBodySchema }),
            handler: resendOTP,
        });
    });

    fastify.post('/auth/logout', {
        handler: logout,
    });
}
