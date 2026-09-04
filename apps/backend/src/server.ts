import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyUnderPressure from '@fastify/under-pressure';
import fastifyWebSocket from '@fastify/websocket';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import dotenv from 'dotenv';
import { db } from './lib/database/connection.js';
import { isDevelopment, logStartup } from './lib/utils/common.js';
import { errorHandler, notFoundHandler } from './lib/middleware/errorHandler.js';
import { loggerHook } from './lib/middleware/logger.js';
import { registerAllRoutes } from './routes.js';

// ---------------------------------------------------------------------------
// Env helpers for Vercel/serverless toggles
// Vercel sets VERCEL=1 automatically — we default long-lived features to OFF there
// Every incompatible feature has its own ENABLE_* flag so it can be toggled per-env
// ---------------------------------------------------------------------------
function isEnabled(key: string, defaultValue: boolean): boolean {
    const val = process.env[key];
    if (val === undefined || val === '') return defaultValue;
    return val === 'true' || val === '1';
}

// Phase 1: check raw VERCEL/ENABLE_DOTENV before loading .env (shell env only)
const rawIsVercel = process.env.VERCEL === '1';
const rawDotenvDisabled = process.env.ENABLE_DOTENV === 'false' || process.env.ENABLE_DOTENV === '0';

// Load .env unless explicitly disabled or on Vercel (Vercel injects env via dashboard)
// We load early so that ENABLE_* flags can also be set via .env for local dev
if (!rawIsVercel && !rawDotenvDisabled) {
    dotenv.config({ debug: isDevelopment });
}

// Phase 2: final flags after dotenv loaded
const isVercel = process.env.VERCEL === '1';

// Feature flags — each incompatible/long-lived feature has its own env var
export const ENABLE_DOTENV = isEnabled('ENABLE_DOTENV', !isVercel);
export const ENABLE_UNDER_PRESSURE = isEnabled('ENABLE_UNDER_PRESSURE', !isVercel);
export const ENABLE_WEBSOCKET = isEnabled('ENABLE_WEBSOCKET', !isVercel);
export const ENABLE_GRACEFUL_SHUTDOWN = isEnabled('ENABLE_GRACEFUL_SHUTDOWN', !isVercel);
export const ENABLE_COLLABORATION = isEnabled('ENABLE_COLLABORATION', ENABLE_WEBSOCKET);

const PORT = Number(process.env.PORT) || 4003;

// Create Fastify instance with Zod type provider for native performance
export const app = Fastify({
    logger: isDevelopment,
    bodyLimit: 10485760, // 10MB in bytes
}).withTypeProvider<ZodTypeProvider>();

// Set Zod validators for automatic schema validation
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Register plugins
export async function setupPlugins() {
    // Cookie parser MUST be registered first before other plugins
    // This is critical for cookie parsing to work
    await app.register(fastifyCookie);

    // Under pressure - detect server overload (long-lived / memory probe)
    // Disable on Vercel serverless via ENABLE_UNDER_PRESSURE=false
    if (ENABLE_UNDER_PRESSURE) {
        await app.register(fastifyUnderPressure, {
            maxEventLoopDelay: 8000,
            maxHeapUsedBytes: 256 * 1024 * 1024, // 256MB
            maxRssBytes: 512 * 1024 * 1024, // 512MB
            retryAfter: 5, // seconds
            message: 'SERVER_NUKED',
            exposeStatusRoute: false,
        });
    }

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

    // WebSocket support — NOT supported on Vercel Functions (Fluid)
    // Disable via ENABLE_WEBSOCKET=false (defaults to false on Vercel)
    if (ENABLE_WEBSOCKET) {
        await app.register(fastifyWebSocket, {
            options: {
                maxPayload: 1024 * 50, // 50KB
            },
        });
    } else {
        app.log.info('WebSocket disabled via ENABLE_WEBSOCKET=false');
    }

    // request logger (only in development)
    if (isDevelopment) {
        app.addHook('preHandler', loggerHook);
    }

    // Register error handlers
    app.setErrorHandler(errorHandler);
    app.setNotFoundHandler(notFoundHandler);
}

// Graceful shutdown — meaningless on Vercel serverless, toggle via ENABLE_GRACEFUL_SHUTDOWN
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

if (ENABLE_GRACEFUL_SHUTDOWN) {
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
}

// Build app (plugins + routes) without binding to a port — used by Vercel serverless
let appBuilt = false;
export async function buildApp() {
    if (appBuilt) return app;
    await setupPlugins();
    await app.register(registerAllRoutes, { prefix: '/v1' });
    await app.ready();
    appBuilt = true;
    return app;
}

// Vercel Fastify detection requires a top-level fastify.listen() call
// It intercepts listen() and converts the app to a Vercel Function.
// Keep it unconditional so the framework can find it – Vercel will not actually bind a port.
// Use promise chain (no top-level await) so the module exports immediately and doesn't block cold start.
buildApp()
    .then(() => app.listen({ port: PORT, host: '0.0.0.0' }))
    .then(() => {
        if (!isVercel) {
            logStartup(PORT, !!db);
        } else {
            app.log.info(`Vercel function ready – ws:${ENABLE_WEBSOCKET} pressure:${ENABLE_UNDER_PRESSURE} graceful:${ENABLE_GRACEFUL_SHUTDOWN}`);
        }
    })
    .catch(err => {
        app.log.error(err);
        process.exit(1);
    });

export default app;
