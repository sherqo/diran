import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { db } from './shared/database/index.js';
import { authRoutes } from './modules/auth/index.js';
import { userRoutes } from './modules/user/index.js';
import healthRoutes from './shared/routes/health.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(helmet());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Request debugging middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log(`🔍 ${req.method} ${req.path}`, {
        body: req.body,
        headers: req.headers['content-type'],
    });
    next();
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('🚨 Global Error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
    });

    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { 
            stack: error.stack,
            errorName: error.name,
        }),
    });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

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
