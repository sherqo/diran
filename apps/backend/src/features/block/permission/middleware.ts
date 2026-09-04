import { FastifyReply, preHandlerHookHandler } from 'fastify';
import { ApiError } from '../../../lib/middleware/errorHandler.js';
import { HttpStatus, ErrorCode } from '@diran/shared/constants/errors.js';
import { AuthenticatedRequest } from '../../../lib/middleware/auth.js';
import { RoleType } from '@prisma/client';
import { getRoleWithInheritance } from '../../../lib/services/permission.js';

/**
 * Middleware: Require OWNER role on a block.
 * Only owners can manage permissions (add/update/remove).
 */
export const requireOwnerRole: preHandlerHookHandler = async (req: AuthenticatedRequest, _reply: FastifyReply): Promise<void> => {
    const blockId = (req.params as any).id as string;
    const userId = req.user!.id as string;

    const role = await getRoleWithInheritance(userId, blockId);

    if (role !== RoleType.OWNER) {
        throw new ApiError('Access denied: Only owners can manage permissions', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }
};
