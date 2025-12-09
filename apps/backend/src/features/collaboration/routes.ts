import type { FastifyInstance } from 'fastify';
import { handleConnection, getRoomStats } from './handler';

export async function collaborationRoutes(fastify: FastifyInstance): Promise<void> {
    // WebSocket endpoint for collaboration
    fastify.get(
        '/collaborate',
        { websocket: true },
        (socket, _request) => {
            handleConnection(socket);
        }
    );

    // REST endpoint for room stats (monitoring)
    fastify.get('/collaborate/stats', async (_request, reply) => {
        const stats = getRoomStats();
        return reply.send(stats);
    });
}
