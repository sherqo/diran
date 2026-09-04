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
    // Check database connection with timeout – don't hang Vercel function if DB unreachable
    let database: GetHealthResponseData['database'] = 'connected';
    try {
        await Promise.race([
            db.$queryRaw`SELECT 1`,
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 2000)),
        ]);
    } catch {
        database = 'disconnected';
    }

    const data: GetHealthResponseData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database,
    };

    sendSuccess(reply, data);
};
