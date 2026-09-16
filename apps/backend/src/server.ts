import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import { errorHandler, notFoundHandler } from './lib/middleware/errorHandler.js';
import { registerAllRoutes } from './routes.js';

// Vercel-only entrypoint. Kept in the exact shape of Vercel's Fastify
// template: instance named `fastify`, routes registered synchronously,
// and a top-level `fastify.listen()` call which Vercel intercepts and
// turns into the serverless function. Do NOT wrap listen() in try/catch,
// conditionals, or top-level await — that breaks Vercel's detection and
// every request hangs until FUNCTION_INVOCATION_TIMEOUT.
const fastify = Fastify({
    logger: true,
    bodyLimit: 10485760, // 10MB in bytes
}).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(fastifyCookie);

fastify.register(fastifyHelmet, {
    contentSecurityPolicy: false, // Disable CSP for API
});

fastify.register(fastifyCors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
});

fastify.register(fastifyRateLimit, {
    max: 150,
    timeWindow: '1 minute',
});

fastify.setErrorHandler(errorHandler);
fastify.setNotFoundHandler(notFoundHandler);

fastify.get('/ping', async () => {
    return { pong: true, time: new Date().toISOString() };
});

fastify.get('/', async () => {
    return { hello: 'diran', time: new Date().toISOString(), status: 'ok' };
});

fastify.register(registerAllRoutes, { prefix: '/v1' });

fastify.listen({ port: 3000 });

export default fastify;
