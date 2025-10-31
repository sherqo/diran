import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '#lib/database/connection';
import { sendSuccess } from '#lib/utils/response';
import { GetHealthResponseData } from '@diran/shared';

export const getHealth = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Check database connection
    await db.$queryRaw`SELECT 1`;

    const data: GetHealthResponseData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
    };

    sendSuccess(reply, data);
};
