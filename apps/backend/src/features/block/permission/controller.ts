import { FastifyReply } from 'fastify';
import { db } from '#lib/database/connection.js';
import { AuthenticatedRequest } from '#lib/middleware/auth.js';
import { sendSuccess } from '#lib/utils/response.js';
import { ApiError } from '#lib/middleware/errorHandler.js';
import { HttpStatus, ErrorCode } from '@diran/shared/constants/errors.js';
import { RoleType } from '@prisma/client';
import {
    BlockIdParamInput,
    PermissionIdParamInput,
    AddPermissionBodyInput,
    UpdatePermissionBodyInput,
} from '@diran/shared/validation/permission.js';

/**
 * List all permissions for a block.
 * Requires OWNER role.
 */
export const listPermissions = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { id: blockId } = req.params as BlockIdParamInput;

    const permissions = await db.permission.findMany({
        where: { blockId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    photo: true,
                },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    const response = permissions.map(p => ({
        id: p.id,
        user: {
            id: p.user.id,
            name: p.user.name,
            email: p.user.email,
            photo: p.user.photo,
        },
        role: p.role,
        createdAt: p.createdAt.toISOString(),
    }));

    return sendSuccess(reply, { permissions: response, blockId }, 'Permissions retrieved successfully');
};

/**
 * Add a permission (share block with a user by email).
 * Requires OWNER role.
 */
export const addPermission = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { id: blockId } = req.params as BlockIdParamInput;
    const { email, role } = req.body as AddPermissionBodyInput;
    const currentUserId = req.user!.id;

    // Find user by email
    const targetUser = await db.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true, photo: true },
    });

    if (!targetUser) {
        throw new ApiError('User not found with this email', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Can't share with yourself
    if (targetUser.id === currentUserId) {
        throw new ApiError('Cannot change your own permission', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Check if permission already exists
    const existing = await db.permission.findUnique({
        where: {
            userId_blockId: {
                userId: targetUser.id,
                blockId,
            },
        },
    });

    if (existing) {
        throw new ApiError('User already has permission on this block', HttpStatus.CONFLICT, ErrorCode.ALREADY_EXISTS);
    }

    // Create permission
    const permission = await db.permission.create({
        data: {
            userId: targetUser.id,
            blockId,
            role: role as RoleType,
        },
    });

    return sendSuccess(
        reply,
        {
            permission: {
                id: permission.id,
                user: {
                    id: targetUser.id,
                    name: targetUser.name,
                    email: targetUser.email,
                    photo: targetUser.photo,
                },
                role: permission.role,
                createdAt: permission.createdAt.toISOString(),
            },
        },
        'Permission added successfully',
        HttpStatus.CREATED
    );
};

/**
 * Update a permission (change role).
 * Requires OWNER role.
 */
export const updatePermission = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { id: blockId, permissionId } = req.params as PermissionIdParamInput;
    const { role } = req.body as UpdatePermissionBodyInput;
    const currentUserId = req.user!.id;

    // Find the permission
    const permission = await db.permission.findUnique({
        where: { id: permissionId },
        include: {
            user: {
                select: { id: true, name: true, email: true, photo: true },
            },
        },
    });

    if (!permission || permission.blockId !== blockId) {
        throw new ApiError('Permission not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Can't change your own permission
    if (permission.userId === currentUserId) {
        throw new ApiError('Cannot change your own permission', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Can't change an owner's permission
    if (permission.role === RoleType.OWNER) {
        throw new ApiError('Cannot change owner permission', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    // Update
    const updated = await db.permission.update({
        where: { id: permissionId },
        data: { role: role as RoleType },
    });

    return sendSuccess(
        reply,
        {
            permission: {
                id: updated.id,
                user: {
                    id: permission.user.id,
                    name: permission.user.name,
                    email: permission.user.email,
                    photo: permission.user.photo,
                },
                role: updated.role,
                createdAt: updated.createdAt.toISOString(),
            },
        },
        'Permission updated successfully'
    );
};

/**
 * Remove a permission.
 * Requires OWNER role.
 */
export const removePermission = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { id: blockId, permissionId } = req.params as PermissionIdParamInput;
    const currentUserId = req.user!.id;

    // Find the permission
    const permission = await db.permission.findUnique({
        where: { id: permissionId },
    });

    if (!permission || permission.blockId !== blockId) {
        throw new ApiError('Permission not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Can't remove your own permission
    if (permission.userId === currentUserId) {
        throw new ApiError('Cannot remove your own permission', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Can't remove an owner's permission
    if (permission.role === RoleType.OWNER) {
        throw new ApiError('Cannot remove owner permission', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    // Delete
    await db.permission.delete({
        where: { id: permissionId },
    });

    return sendSuccess(reply, null, 'Permission removed successfully');
};
