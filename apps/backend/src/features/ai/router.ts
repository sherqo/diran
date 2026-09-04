import { FastifyInstance } from 'fastify';
import { handleAiRequest } from './controller';
import { validateRequest } from '#lib/middleware/validation.js';
import { aiRequestSchema } from '@diran/shared';

export async function registerAiRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.post('/', {
        preHandler: [validateRequest({ bodySchema: aiRequestSchema })],
        config: {
            rateLimit: {
                max: 3,
                timeWindow: '1 minute',
            },
        },
        handler: handleAiRequest,
    });
}
