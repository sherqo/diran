import { Router, Request, Response } from 'express';
import { db } from '../../shared/database';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        // Check database connection
        await db.$queryRaw`SELECT 1`;

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected',
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'disconnected',
            error: 'Database connection failed',
        });
    }
});

export default router;
