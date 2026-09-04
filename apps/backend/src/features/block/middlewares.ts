import { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { ApiError } from '#lib/middleware/errorHandler.js';
import { HttpStatus, ErrorCode } from '@diran/shared/constants/errors.js';
import { AuthenticatedRequest } from '#lib/middleware/auth.js';
import { RoleType } from '@prisma/client';
import { getRoleWithInheritance } from '#lib/services/permission.js';

/**
 * Permission helpers
 */

// Read: just view the block
const canRead = (role: RoleType): boolean => {
    return role === RoleType.OWNER || role === RoleType.EDITOR || role === RoleType.VIEWER;
};

// Write: modify, delete the block
export const canWrite = (role: RoleType): boolean => {
    return role === RoleType.OWNER || role === RoleType.EDITOR;
};

/**
 * Middleware: Require read permission on a block.
 * Checks permission with inheritance from parent blocks.
 * Used for: GET operations
 */
export const requireReadPermission: preHandlerHookHandler = async (req: AuthenticatedRequest, _reply: FastifyReply): Promise<void> => {
    const blockId = (req.params as any).id as string;
    const userId = req.user!.id as string;

    const role = await getRoleWithInheritance(userId, blockId);

    if (!role || role === RoleType.NONE || !canRead(role)) {
        throw new ApiError('Access denied: No read permission for this block', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    // Attach role and permissions to request
    req.permissions = {
        role,
        canRead: true,
        canWrite: canWrite(role),
    };
};

/**
 * Middleware: Require write permission on a block.
 * Checks permission with inheritance from parent blocks.
 * Used for: PUT, DELETE operations
 */
export const requireWritePermission: preHandlerHookHandler = async (req: AuthenticatedRequest, _reply: FastifyReply): Promise<void> => {
    const blockId = (req.params as any).id as string;
    const userId = req.user!.id as string;

    const role = await getRoleWithInheritance(userId, blockId);

    if (!role || role === RoleType.NONE || !canWrite(role)) {
        throw new ApiError('Access denied: No write permission for this block', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    // Attach role and permissions to request
    req.permissions = {
        role,
        canRead: true,
        canWrite: true,
    };
};

/**
 * Middleware: Require write permission on parent block.
 * Used when creating a new block with a parentId.
 * Checks that user has write permission on the parent block.
 * Used for: POST operations with parentId in body
 */
export const requireParentPermission: preHandlerHookHandler = async (req: AuthenticatedRequest, _reply: FastifyReply): Promise<void> => {
    const parentId = (req.body as any)?.parentId;

    // If no parentId, skip this check (creating a root page)
    if (!parentId) {
        return;
    }

    const userId = req.user!.id as string;
    const role = await getRoleWithInheritance(userId, parentId);

    if (!role || role === RoleType.NONE || !canWrite(role)) {
        throw new ApiError('Access denied: No write permission on parent block', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }
};
