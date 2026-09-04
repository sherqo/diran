import { FastifyInstance } from 'fastify';
import {
    registerAuthRoutes,
    registerHealthRoutes,
    registerUserRoutes,
    registerBlockRoutes,
    registerPageRoutes,
    registerTeamRoutes,
    registerExtrasRoutes,
    registerAiRoutes,
} from '#features.js';
import { registerUploadRoutes } from '#features/upload/routes.js';
import { collaborationRoutes } from '#features/collaboration/routes.js';

function isEnabled(key: string, defaultValue: boolean): boolean {
    const val = process.env[key];
    if (val === undefined || val === '') return defaultValue;
    return val === 'true' || val === '1';
}
const isVercel = process.env.VERCEL === '1';

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
    await fastify.register(registerUserRoutes, { prefix: '/user' });

    await fastify.register(registerBlockRoutes, { prefix: '/block' });
    await fastify.register(registerPageRoutes, { prefix: '/page' });
    await fastify.register(registerTeamRoutes, { prefix: '/team' });

    await fastify.register(registerUploadRoutes, { prefix: '/upload' });

    await fastify.register(registerHealthRoutes, { prefix: '/health' });
    await fastify.register(registerExtrasRoutes, { prefix: '/extras' });
    await fastify.register(registerAiRoutes, { prefix: '/ai' });

    // Collaboration WebSocket — gated via ENABLE_COLLABORATION / ENABLE_WEBSOCKET
    // Disabled by default on Vercel (VERCEL=1) because Vercel Functions don't support persistent WS
    const enableWebSocket = isEnabled('ENABLE_WEBSOCKET', !isVercel);
    const enableCollab = isEnabled('ENABLE_COLLABORATION', enableWebSocket);
    if (enableCollab && enableWebSocket) {
        await fastify.register(collaborationRoutes, { prefix: '/ws/collab' }); // i really love u <3
    } else {
        fastify.log.info(`Collaboration WS disabled (ENABLE_COLLABORATION=${enableCollab} ENABLE_WEBSOCKET=${enableWebSocket})`);
    }
};
