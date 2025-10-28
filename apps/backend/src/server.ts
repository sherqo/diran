import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import apiRouter from '#routes';
import { errorHandler, notFoundHandler } from '#lib/middleware/errorHandler';
import { logger } from '#lib/middleware/logger';
import { db } from '#lib/database/connection';
import { isDevelopment, logStartup } from '#lib/utils/common';
import { globalRateLimiter } from '#lib/middleware/rateLimiter';

// Load environment variables
dotenv.config({ debug: isDevelopment });

const app = express();
const PORT = Number(process.env.PORT) || 4003;

// Request logger middleware (only in development)
if (isDevelopment) {
    app.use(logger);
}

app.use(globalRateLimiter);

// Middleware
app.use(helmet()); // Security headers
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes with automatic /v1 prefix, it will be hosted on api.diran.app/v1
app.use('/v1', apiRouter);

// Error handling middleware
app.use(notFoundHandler); // 404 handler for unknown routes
app.use(errorHandler); // Global error handler

// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('🔄 Shutting down gracefully...');
    try {
        await db.$disconnect();
        console.log('✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
app.listen(PORT, () => {
    logStartup(PORT, !!db);
});
