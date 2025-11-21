import { FastifyInstance } from 'fastify';
import { addEmailToWaitlist } from './controller.js';

export async function registerExtrasRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.post('/waitlist', {
        preHandler: [],
        config: {
            rateLimit: {
                max: 5,
                timeWindow: '1 hour',
            },
        },
        handler: addEmailToWaitlist,
    });
}
