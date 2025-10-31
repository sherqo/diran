import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { db } from '#lib/database/connection';
import { isDevelopment, logStartup } from '#lib/utils/common';
import { registerAuthRoutes, registerHealthRoutes, registerUserRoutes, registerBlockRoutes } from '#features/index';
import { errorHandler, notFoundHandler } from '#lib/middleware/errorHandler';
import { loggerHook } from '#lib/middleware/logger';

// Load environment variables
dotenv.config({ debug: isDevelopment });

const PORT = Number(process.env.PORT) || 4003;

// Create Fastify instance
const app = Fastify({
    logger: isDevelopment, // built-in logger
    bodyLimit: 10485760, // 10MB in bytes
});

// Register plugins
async function setupPlugins() {
    // Cookie parser MUST be registered first before other plugins
    // This is critical for cookie parsing to work
    await app.register(fastifyCookie);

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
        max: 100,
        timeWindow: '1 minute',
    });

    // Custom request logger (only in development)
    if (isDevelopment) {
        app.addHook('onRequest', loggerHook);
    }

    // Register error handlers
    app.setErrorHandler(errorHandler);
    app.setNotFoundHandler(notFoundHandler);
}

// Register routes
async function setupRoutes() {
    // Register routes directly on app with prefix
    // This ensures they have access to cookie parser and other plugins
    await registerAuthRoutes(app);
    await registerHealthRoutes(app);
    await registerUserRoutes(app);
    await registerBlockRoutes(app);
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
        await setupRoutes();

        await app.listen({ port: PORT, host: '0.0.0.0' });
        logStartup(PORT, !!db);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

start();
