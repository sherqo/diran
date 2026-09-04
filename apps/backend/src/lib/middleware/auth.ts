import { verifyAccessToken } from '../utils/auth.js';
import { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { ApiError } from './errorHandler.js';
import { ErrorCode, HttpStatus } from '@diran/shared/constants/errors.js';
import { AuthUser } from '@diran/shared/types/auth.js';
import { RoleType } from '@prisma/client';

export interface AuthenticatedRequest extends FastifyRequest {
    user?: AuthUser;

    // permissions added by permission middleware(s)
    permissions?: {
        role: RoleType;
        canRead: boolean;
        canWrite: boolean;
    };
}

// TODO: some sort of caching for performance is required
export const getAuthUser = (req: FastifyRequest): AuthUser => {
    const token = req.cookies?.accessToken;

    if (!token) {
        throw new ApiError('Access token required', HttpStatus.UNAUTHORIZED, ErrorCode.ACCESS_TOKEN_REQUIRED);
    }

    const decodedUser = verifyAccessToken(token);

    if (!decodedUser?.id) {
        throw new ApiError('Invalid token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_ACCESS_TOKEN);
    }

    return decodedUser;
};

export const authenticate: preHandlerHookHandler = async (req: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const decodedUser = getAuthUser(req);

    // TODO: fix deleted users by them in a small datastructure for short time
    (req as AuthenticatedRequest).user = decodedUser;
};
