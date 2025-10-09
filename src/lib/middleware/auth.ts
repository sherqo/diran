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
    try {
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
    } catch (error) {
        // If it's already an ApiError, pass it to error handler
        if (error instanceof ApiError) {
            next(error);
            return;
        }
        // For JWT errors or other issues, create and pass generic invalid token error
        const apiError = new ApiError('Invalid token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
        next(apiError);
    }
};
