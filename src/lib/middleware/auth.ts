import { verifyToken } from '#lib/utils/auth';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';
import { ErrorCode, HttpStatus } from '#lib/constants/errors';
import { AuthUser } from '#lib/types/AuthUser';

export interface AuthenticatedRequest extends Request {
    user?: AuthUser;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies.accessToken;

    if (!token) {
        throw new ApiError('Access token required', HttpStatus.UNAUTHORIZED, ErrorCode.ACCESS_TOKEN_REQUIRED);
    }

    const decodedUser = verifyToken(token);

    if (!decodedUser?.id) {
        throw new ApiError('Invalid token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_TOKEN);
    }

    if (!decodedUser.emailVerified) {
        throw new ApiError('Email not verified', HttpStatus.UNAUTHORIZED, ErrorCode.EMAIL_NOT_VERIFIED);
    }

    req.user = decodedUser;
    next();
};
