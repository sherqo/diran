import type { FastifyInstance, FastifyRequest } from 'fastify';
import { handleConnection } from './handler';
import { getAuthUser } from '../../lib/middleware/auth.js';

export async function collaborationRoutes(fastify: FastifyInstance): Promise<void> {
    // ws endpoint for collab - love u <3
    fastify.get('/', { websocket: true }, (socket, request: FastifyRequest) => {
        const authUser = getAuthUser(request);
        handleConnection(socket, authUser);
    });
}
