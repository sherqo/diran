import type { FastifyInstance, FastifyRequest } from 'fastify';
import { handleConnection, getRoomStats } from './handler';
import { verifyAccessToken } from '#lib/utils/auth.js';
import type { AuthUser } from '@diran/shared/types/auth';
import { getAuthUser } from '#lib/middleware/auth';

export async function collaborationRoutes(fastify: FastifyInstance): Promise<void> {
    // ws endpoint for collab
    fastify.get('/', { websocket: true }, (socket, request: FastifyRequest) => {
        const authUser = getAuthUser(request);
        handleConnection(socket, authUser);
    });

    // REST http endpoint for room stats
    fastify.get('/stats', async (_request, reply) => {
        const stats = getRoomStats();
        return reply.send(stats);
    });
}
