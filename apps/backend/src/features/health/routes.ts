import { FastifyInstance } from 'fastify';
import fastifyRateLimit from '@fastify/rate-limit';
import { healthCheckRateLimiterConfig as rl } from '#lib/middleware/rateLimiter';
import { getHealth } from './controller';

export async function registerHealthRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.get('/v1/health', {
        handler: getHealth,
    });
}
