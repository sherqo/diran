import { Request, Response } from 'express';
import { db } from '#lib/database/connection';
import { asyncHandler } from '#lib/middleware/errorHandler';
import { sendSuccess } from '#lib/utils/response';

export const getHealth = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Check database connection
    await db.$queryRaw`SELECT 1`;

    sendSuccess(res, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
    });
});
