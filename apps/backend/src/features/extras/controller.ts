import { db } from '../../lib/database/connection.js';
import { sendError, sendSuccess } from '../../lib/utils/response.js';
import { FastifyRequest, FastifyReply } from 'fastify';
import { GetHealthResponseData } from '@diran/shared';

export const addEmailToWaitlist = async (req: FastifyRequest, reply: FastifyReply) => {
    const { email } = req.body as { email: string };
    if (!email || typeof email !== 'string') {
        sendError(reply, 'Invalid email provided', 400);
        return;
    }

    const result = await db.waitlist.create({
        data: {
            email: email,
        },
        select: {
            id: true,
            email: true,
            createdAt: true,
        },
    });

    sendSuccess(reply, { waitlistEntry: result }, 'Email added to waitlist successfully');
};

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
