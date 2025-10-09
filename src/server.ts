import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRouter from '#routes';
import { errorHandler, notFoundHandler } from '#lib/middleware/errorHandler';
import { db } from '#lib/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(helmet()); // Security headers
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes with automatic /v1 prefix, it will be hosted on api.diran.app/v1
app.use('/v1', apiRouter);

// Request debugging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.log(`🔍 ${req.method} ${req.path}`, {
            body: Object.keys(req.body).length > 0 ? req.body : undefined,
            headers: req.headers['content-type'],
        });
        next();
    });
}

// 404 handler for unknown routes
app.use('*', notFoundHandler);

// Global error handler
app.use(errorHandler);

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
const server = app.listen(PORT, () => {
    console.log(`🚀 Diran AI Backend server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
