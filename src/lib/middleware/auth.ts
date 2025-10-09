import { db } from '#lib/database/connection';
import { verifyToken } from '#lib/utils/auth';
import { Request, Response, NextFunction } from 'express';
import { sendUnauthorized } from '../utils/response';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            sendUnauthorized(res, 'Access token required');
            return;
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        const user = await db.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true },
        });

        if (!user) {
            sendUnauthorized(res, 'Invalid token');
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        sendUnauthorized(res, 'Invalid token');
    }
};
