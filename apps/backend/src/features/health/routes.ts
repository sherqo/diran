import { FastifyInstance } from 'fastify';
import fastifyRateLimit from '@fastify/rate-limit';
import { healthCheckRateLimiterConfig as rl } from '#lib/middleware/rateLimiter';
import { getHealth } from './controller';

// adding  rate limiter to health check route
export async function registerHealthRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.register(async fastify => {
        await fastify.register(fastifyRateLimit, rl);
        fastify.get('/', {
            handler: getHealth,
        });
    });
}
