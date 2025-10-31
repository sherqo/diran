import { FastifyInstance } from 'fastify';
import fastifyRateLimit from '@fastify/rate-limit';
import { validateRequest as vr } from '#lib/middleware/validation.js';
import { authenticate } from '#lib/middleware/auth.js';
import { getProfile, updateProfile, changePassword } from './controller.js';
import { updateProfileSchema, changePasswordSchema } from '@diran/shared/validation/user.js';
import { profileRateLimiter as rl } from '#lib/middleware/rateLimiter.js';

export async function registerUserRoutes(fastify: FastifyInstance): Promise<void> {
    // All user routes require authentication
    fastify.get('/user/profile', {
        preHandler: authenticate,
        handler: getProfile,
    });

    // Update profile with rate limiting
    await fastify.register(async fastify => {
        await fastify.register(fastifyRateLimit, rl.updateProfile);

        fastify.patch('/user/profile', {
            preHandler: [vr({ bodySchema: updateProfileSchema }), authenticate],
            handler: updateProfile,
        });
    });

    // Change password with rate limiting
    await fastify.register(async fastify => {
        await fastify.register(fastifyRateLimit, rl.changePassword);

        fastify.post('/user/change-password', {
            preHandler: [vr({ bodySchema: changePasswordSchema }), authenticate],
            handler: changePassword,
        });
    });
}
