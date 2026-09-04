import { FastifyInstance } from 'fastify';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyMultipart from '@fastify/multipart';
import { authenticate as auth } from '../../lib/middleware/auth.js';
import { uploadFile } from './controller.js';

export async function registerUploadRoutes(fastify: FastifyInstance): Promise<void> {
    // Register multipart support for file uploads
    await fastify.register(fastifyMultipart, {
        limits: {
            fileSize: 100 * 1024 * 1024, // 100MB max file size (for videos)
            files: 1, // Only allow 1 file at a time
        },
    });

    // Upload file with rate limiting
    await fastify.register(fastify => {
        fastify.register(fastifyRateLimit, {
            max: 10, // 10 uploads
            timeWindow: '1 minute',
        });

        fastify.post('/', {
            preHandler: [auth],
            handler: uploadFile,
        });
    });
}
