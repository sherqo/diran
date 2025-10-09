import { Request, Response } from 'express';
import { db } from '../../lib/database';
import { sendSuccess, sendInternalError } from '../../lib/utils/response';
import { asyncHandler } from '../../shared/middleware/errorHandler';

export const getHealth = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        // Check database connection
        await db.$queryRaw`SELECT 1`;

        sendSuccess(res, {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected',
        });
    } catch (error) {
        sendInternalError(res, 'Database connection failed', {
            status: 'error',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'disconnected',
        });
    }
});
