import { db } from '#lib/database/connection';
import { sendError, sendSuccess } from '#lib/utils/response';
import { FastifyRequest, FastifyReply } from 'fastify';

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
