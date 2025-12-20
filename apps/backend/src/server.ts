import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyUnderPressure from '@fastify/under-pressure';
import fastifyWebSocket from '@fastify/websocket';
import dotenv from 'dotenv';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import { db } from '#lib/database/connection';
import { isDevelopment, logStartup } from '#lib/utils/common';
import { errorHandler, notFoundHandler } from '#lib/middleware/errorHandler';
import { loggerHook } from '#lib/middleware/logger';
import { registerAllRoutes } from '#routes';

// Load environment variables
dotenv.config({ debug: isDevelopment });

const PORT = Number(process.env.PORT) || 4003;

// Create Fastify instance with Zod type provider for native performance
const app = Fastify({
    logger: isDevelopment,
    bodyLimit: 10485760, // 10MB in bytes
}).withTypeProvider<ZodTypeProvider>();

// Set Zod validators for automatic schema validation
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Register plugins
async function setupPlugins() {
    // Swagger documentation (register before routes, only in development)
    if (isDevelopment) {
        await app.register(fastifySwagger, {
            openapi: {
                openapi: '3.1.0',
                info: {
                    title: 'Diran API',
                    description: 'API documentation for Diran backend',
                    version: '0.1.0',
                },
            },
        });

        await app.register(fastifySwaggerUi, {
            routePrefix: '/docs',
            uiConfig: {
                docExpansion: 'list',
                deepLinking: true,
            },
            staticCSP: true,
        });
    }

    // Cookie parser MUST be registered first before other plugins
    // This is critical for cookie parsing to work
    await app.register(fastifyCookie);

    // Under pressure - detect server overload
    await app.register(fastifyUnderPressure, {
        maxEventLoopDelay: 8000, // 8s, Railway CPUs can lag easily
        maxHeapUsedBytes: 256 * 1024 * 1024, // 256MB
        maxRssBytes: 512 * 1024 * 1024, // 512MB
        retryAfter: 5, // seconds
        message: 'SERVER_NUKED',
        exposeStatusRoute: false,
    });

    // Helmet for security headers
    await app.register(fastifyHelmet, {
        contentSecurityPolicy: false, // Disable CSP for API
    });

    // CORS
    await app.register(fastifyCors, {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['set-cookie'],
    });

    // Global rate limiter
    await app.register(fastifyRateLimit, {
        max: 150,
        timeWindow: '1 minute',
    });

    // WebSocket support for real-time collaboration
    await app.register(fastifyWebSocket, {
        options: {
            maxPayload: 1024 * 50, // 50KB
        },
    });

    // request logger (only in development)
    if (isDevelopment) {
        app.addHook('preHandler', loggerHook);
    }

    // Register error handlers
    app.setErrorHandler(errorHandler);
    app.setNotFoundHandler(notFoundHandler);
}

// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('🔄 Shutting down gracefully...');
    try {
        await app.close();
        await db.$disconnect();
        console.log('✅ Server and database connections closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
async function start() {
    try {
        await setupPlugins();
        await app.register(registerAllRoutes, { prefix: '/v1' });

        await app.listen({ port: PORT, host: '0.0.0.0' });
        logStartup(PORT, !!db);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

start();
