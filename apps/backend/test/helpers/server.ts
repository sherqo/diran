/**
 * Test server factory
 * Creates a clean Fastify instance for testing
 */

import Fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyCompress from '@fastify/compress';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import { errorHandler, notFoundHandler } from '#lib/middleware/errorHandler';
import { registerAllRoutes } from '#routes';

export async function createTestServer(): Promise<FastifyInstance> {
    const app = Fastify({
        logger: false, // Disable logging in tests
        bodyLimit: 10485760,
    }).withTypeProvider<ZodTypeProvider>();

    // Set validators
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    // Register plugins (minimal setup for tests)
    await app.register(fastifyCookie);
    await app.register(fastifyCompress, {
        global: true,
        threshold: 1024,
        encodings: ['br', 'gzip', 'deflate'],
    });
    await app.register(fastifyHelmet, {
        contentSecurityPolicy: false,
    });
    await app.register(fastifyCors, {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['set-cookie'],
    });

    // Higher rate limit for tests
    await app.register(fastifyRateLimit, {
        max: 1000,
        timeWindow: '1 minute',
    });

    // Error handlers
    app.setErrorHandler(errorHandler);
    app.setNotFoundHandler(notFoundHandler);

    // Register routes
    await app.register(registerAllRoutes, { prefix: '/v1' });

    return app;
}
