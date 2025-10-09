import { db } from '#lib/database/connection';
import { verifyToken } from '#lib/utils/auth';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';
import { ErrorCode, HttpStatus } from '#lib/constants/errors';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    // TODO: cache user data to reduce DB calls later
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError('Access token required', HttpStatus.UNAUTHORIZED, ErrorCode.ACCESS_TOKEN_REQUIRED);
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true },
    });

    if (!user) {
        throw new ApiError('Invalid token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
    }

    req.user = user;
    next();
};
