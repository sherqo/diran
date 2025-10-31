import { verifyAccessToken } from '#lib/utils/auth';
import { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { ApiError } from './errorHandler';
import { ErrorCode, HttpStatus } from '@diran/shared/constants/errors';
import { AuthUser } from '@diran/shared/types/auth';

export interface AuthenticatedRequest extends FastifyRequest {
    user?: AuthUser;

    // permissions added by permission middleware(s)
    permissions?: {
        canRead: boolean;
        canWrite: boolean;
    };
}

export const authenticate: preHandlerHookHandler = async (req: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const token = req.cookies?.accessToken;

    if (!token) {
        throw new ApiError('Access token required', HttpStatus.UNAUTHORIZED, ErrorCode.ACCESS_TOKEN_REQUIRED);
    }

    const decodedUser = verifyAccessToken(token);

    if (!decodedUser?.id) {
        throw new ApiError('Invalid token', HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_ACCESS_TOKEN);
    }

    // TODO: fix deleted users by them in a small datastructure for short time
    (req as AuthenticatedRequest).user = decodedUser;
};
