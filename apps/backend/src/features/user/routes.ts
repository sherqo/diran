import { FastifyInstance } from 'fastify';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyMultipart from '@fastify/multipart';
import { validateRequest as vr } from '../../lib/middleware/validation.js';
import { authenticate as auth } from '../../lib/middleware/auth.js';
import { getProfile, updateProfile, changePassword, uploadProfilePhoto } from './controller.js';
import { updateProfileSchema, changePasswordSchema } from '@diran/shared/validation/user.js';
import { profileRateLimiter as rl } from '../../lib/middleware/rateLimiter.js';

export async function registerUserRoutes(fastify: FastifyInstance): Promise<void> {
    // Register multipart support for file uploads
    await fastify.register(fastifyMultipart, {
        limits: {
            fileSize: 20 * 1024 * 1024, // 20MB max file size
            files: 1, // Only allow 1 files at a time
        },
    });

    // All user routes require authentication
    fastify.get('/profile', {
        preHandler: auth,
        handler: getProfile,
    });

    // Update profile with rate limiting
    await fastify.register(fastify => {
        fastify.register(fastifyRateLimit, rl.updateProfile);

        fastify.patch('/profile', {
            preHandler: [vr({ bodySchema: updateProfileSchema }), auth],
            handler: updateProfile,
        });
    });

    // Upload profile photo with rate limiting
    await fastify.register(fastify => {
        fastify.register(fastifyRateLimit, rl.updateProfile);

        fastify.post('/profile/photo', {
            preHandler: [auth],
            handler: uploadProfilePhoto,
        });
    });

    // Change password with rate limiting
    await fastify.register(fastify => {
        fastify.register(fastifyRateLimit, rl.changePassword);

        fastify.post('/change-password', {
            preHandler: [vr({ bodySchema: changePasswordSchema }), auth],
            handler: changePassword,
        });
    });
}
