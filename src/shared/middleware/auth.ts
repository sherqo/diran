import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';
import { db } from '../database';

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
            res.status(401).json({
                success: false,
                message: 'Access token required',
            });
            return;
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        const user = await db.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true },
        });

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
};
