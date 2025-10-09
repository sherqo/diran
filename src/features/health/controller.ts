import { Request, Response } from 'express';
import { db } from '#lib/database/connection';
import { sendSuccess } from '#lib/utils/response';

export const getHealth = async (req: Request, res: Response): Promise<void> => {
    // Check database connection
    await db.$queryRaw`SELECT 1`;

    sendSuccess(res, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
    });
};
