import { FastifyInstance } from 'fastify';
import { addEmailToWaitlist } from './controller.js';

import fastifyRateLimit from '@fastify/rate-limit';
import { healthCheckRateLimiterConfig as rl } from '#lib/middleware/rateLimiter.js';
import { getHealth } from './controller';

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

// adding  rate limiter to health check route
export async function registerHealthRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.register(async fastify => {
        await fastify.register(fastifyRateLimit, rl);
        fastify.get('/', {
            handler: getHealth,
        });
    });
}
