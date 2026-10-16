import { FastifyInstance } from 'fastify';
import { handleAiRequest } from '#features/ai/controller.js';
import { validateRequest } from '#lib/middleware/validation.js';
import { authenticate as auth } from '#lib/middleware/auth.js';
import { aiRequestSchema } from '@diran/shared';

export async function registerAiRoutes(fastify: FastifyInstance): Promise<void> {
    // Logged-in users only: every call spends our Gemini quota.
    fastify.post('/', {
        preHandler: [validateRequest({ bodySchema: aiRequestSchema }), auth],
        bodyLimit: 100 * 1024, // a prompt plus a few blocks of context
        config: {
            rateLimit: {
                max: 3,
                timeWindow: '1 minute',
            },
        },
        handler: handleAiRequest,
    });
}
