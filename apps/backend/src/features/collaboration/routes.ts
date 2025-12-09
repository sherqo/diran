import type { FastifyInstance } from 'fastify';
import { handleConnection, getRoomStats } from './handler';

export async function collaborationRoutes(fastify: FastifyInstance): Promise<void> {
    // WebSocket endpoint for collaboration
    fastify.get('/', { websocket: true }, (socket, _request) => {
        handleConnection(socket);
    });

    // REST endpoint for room stats (monitoring)
    fastify.get('/stats', async (_request, reply) => {
        const stats = getRoomStats();
        return reply.send(stats);
    });
}
