import { FastifyRequest, FastifyReply } from 'fastify';

// Fastify hook for logging requests
export const loggerHook = async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    console.log(`🔍 ${request.method} ${request.url}`, {
        body: request.body && typeof request.body === 'object' && Object.keys(request.body).length > 0 ? request.body : undefined,
        headers: request.headers['content-type'],
    });
};
