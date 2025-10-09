import { db } from '#lib/database/connection';
import { verifyToken } from '#lib/utils/auth';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';
import { ErrorCode, HttpStatus } from '#lib/constants/errors';
import { AuthUser } from '#lib/types/AuthUser';

export interface AuthenticatedRequest extends Request {
    user?: AuthUser;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    // TODO: cache user data to reduce DB calls later
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError('Access token required', HttpStatus.UNAUTHORIZED, ErrorCode.ACCESS_TOKEN_REQUIRED);
    }

    const token = authHeader.substring(7);
    const decodedUser = verifyToken(token);

    if (!decodedUser || !decodedUser.id) {
        throw new ApiError('Invalid token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
    }

    const user = await db.user.findUnique({
        where: { id: decodedUser.id },
        select: { id: true, email: true, name: true },
    });

    if (!user) {
        throw new ApiError('Invalid token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
    }

    req.user = user;
    next();
};
