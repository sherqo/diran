import { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { ApiError } from '#lib/middleware/errorHandler';
import { HttpStatus, ErrorCode } from '@diran/shared/constants/errors';
import { AuthenticatedRequest } from '#lib/middleware/auth';

/**
 * when we need it:
 * accessing, modifying, deleting blocks
 *
 * blocks have id, comes from req.params.id
 * actor comes from req.user.id (added by authentication middleware)
 *
 * Users have roles, roles have permissions
 *
 * so the flow will be:
 * 1. get block type from url
 * 2. get block id from req.params.id
 * 3. get actor id from req.user.id
 * 4. check if actor has permission to access block
 */

import { RoleType } from '@prisma/client';
import { getRole } from '#lib/services/permission';

// Read: just view the block
const canRead = (role: RoleType): boolean => {
    return role === RoleType.OWNER || role === RoleType.EDITOR || role === RoleType.VIEWER;
};

// Write: modify, delete the block
const canWrite = (role: RoleType): boolean => {
    return role === RoleType.OWNER || role === RoleType.EDITOR;
};

// What this do?
// just tells if the actor has permission to access the block or not and tells you what can they do!
export const validatePermission: preHandlerHookHandler = async (req: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const blockId = (req.params as any).id as string;
    const userId = authReq.user!.id as string;

    const role = await getRole(userId, blockId);

    if (!role || role === RoleType.NONE) {
        throw new ApiError('Access denied: No permission for this block', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    // TODO: maybe then be splited into two middlewares -> reject too early...
    const perms = {
        canRead: canRead(role),
        canWrite: canWrite(role),
    };

    // Attach
    authReq.permissions = perms;
};
