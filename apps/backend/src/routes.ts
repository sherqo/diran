// THIS FILE IS NO LONGER NEEDED - Routes are now registered directly in server.ts with Fastify
// Kept for reference during migration

import { FastifyInstance } from 'fastify';
import { registerAuthRoutes, registerHealthRoutes, registerUserRoutes, registerBlockRoutes } from '#features';

/**
 * OLD EXPRESS ROUTES STRUCTURE (for reference):
 *
 * in each route file or - simply - request, here's the order:
 *  1. rate limiters - if any - we've a global rate limiter anyways ^_^
 *  2. timeout middleware - MUST - we don't have a global timeout middleware!!
 *  3. Zod schema validation middlewares - if any
 *  4. authentication middleware - if any - for protected routes
 *  5. permission middlewares - if any - for resources access
 *  .
 *  .
 *  finally. controller
 */

export const registerAllRoutes = async (fastify: FastifyInstance) => {
    await fastify.register(registerAuthRoutes, { prefix: '/auth' });
    await fastify.register(registerHealthRoutes, { prefix: '/health' });
    await fastify.register(registerUserRoutes, { prefix: '/user' });
    await fastify.register(registerBlockRoutes, { prefix: '/block' });
};
