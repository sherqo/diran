import { FastifyReply } from 'fastify';
import { db } from '#lib/database/connection.js';
import { AuthenticatedRequest } from '#lib/middleware/auth.js';
import { sendSuccess } from '#lib/utils/response.js';
import { ApiError } from '#lib/middleware/errorHandler.js';
import { HttpStatus, ErrorCode } from '@diran/shared/constants/errors.js';
import { TeamRole } from '@prisma/client';
import {
    TeamIdParamInput,
    TeamMemberIdParamInput,
    AddMemberBodyInput,
    UpdateMemberBodyInput,
} from '@diran/shared/validation/team.js';
import { TeamMemberResponse } from '@diran/shared/types/team.js';

/**
 * Format member response.
 */
const formatMemberResponse = (member: any): TeamMemberResponse => ({
    id: member.id,
    user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        photo: member.user.photo,
    },
    role: member.role,
    joinedAt: member.joinedAt.toISOString(),
});

/**
 * Helper: Check if user can manage members.
 * Owner or Admin can add/remove/update members.
 */
const canManageMembers = async (userId: string, teamId: string): Promise<{ isOwner: boolean; isAdmin: boolean }> => {
    const team = await db.team.findUnique({
        where: { id: teamId },
        select: { ownerId: true },
    });

    if (!team) {
        throw new ApiError('Team not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (team.ownerId === userId) {
        return { isOwner: true, isAdmin: false };
    }

    const membership = await db.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId } },
        select: { role: true },
    });

    if (membership?.role === TeamRole.ADMIN) {
        return { isOwner: false, isAdmin: true };
    }

    return { isOwner: false, isAdmin: false };
};

/**
 * Add a member to a team.
 * Requires: Owner or Admin.
 */
export const addMember = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { teamId } = req.params as TeamIdParamInput;
    const userId = req.user!.id;
    const { email, role } = req.body as AddMemberBodyInput;

    const { isOwner, isAdmin } = await canManageMembers(userId, teamId);

    if (!isOwner && !isAdmin) {
        throw new ApiError('Only owner or admin can add members', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    // Find user by email
    const targetUser = await db.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true, photo: true },
    });

    if (!targetUser) {
        throw new ApiError('User not found with this email', HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    // Check if user is already the owner
    const team = await db.team.findUnique({ where: { id: teamId }, select: { ownerId: true } });
    if (team?.ownerId === targetUser.id) {
        throw new ApiError('User is already the owner of this team', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Check if already a member
    const existing = await db.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: targetUser.id } },
    });

    if (existing) {
        throw new ApiError('User is already a member of this team', HttpStatus.CONFLICT, ErrorCode.ALREADY_EXISTS);
    }

    // Only owner can add admins
    if (role === 'ADMIN' && !isOwner) {
        throw new ApiError('Only owner can add admins', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    const member = await db.teamMember.create({
        data: {
            teamId,
            userId: targetUser.id,
            role: role as TeamRole,
        },
        include: {
            user: {
                select: { id: true, name: true, email: true, photo: true },
            },
        },
    });

    return sendSuccess(reply, { member: formatMemberResponse(member) }, 'Member added successfully', HttpStatus.CREATED);
};

/**
 * Update a member's role.
 * Requires: Owner (for admin changes) or Admin (for member changes).
 */
export const updateMember = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { teamId, memberId } = req.params as TeamMemberIdParamInput;
    const userId = req.user!.id;
    const { role } = req.body as UpdateMemberBodyInput;

    const { isOwner, isAdmin } = await canManageMembers(userId, teamId);

    if (!isOwner && !isAdmin) {
        throw new ApiError('Only owner or admin can update members', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    const member = await db.teamMember.findUnique({
        where: { id: memberId },
        select: { teamId: true, userId: true, role: true },
    });

    if (!member || member.teamId !== teamId) {
        throw new ApiError('Member not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Admin can only update members, not other admins
    if (!isOwner && member.role === TeamRole.ADMIN) {
        throw new ApiError('Only owner can update admin roles', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    // Only owner can promote to admin
    if (role === 'ADMIN' && !isOwner) {
        throw new ApiError('Only owner can promote to admin', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    const updated = await db.teamMember.update({
        where: { id: memberId },
        data: { role: role as TeamRole },
        include: {
            user: {
                select: { id: true, name: true, email: true, photo: true },
            },
        },
    });

    return sendSuccess(reply, { member: formatMemberResponse(updated) }, 'Member updated successfully');
};

/**
 * Remove a member from a team.
 * Requires: Owner or Admin (admins can only remove members, not other admins).
 */
export const removeMember = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { teamId, memberId } = req.params as TeamMemberIdParamInput;
    const userId = req.user!.id;

    const { isOwner, isAdmin } = await canManageMembers(userId, teamId);

    if (!isOwner && !isAdmin) {
        throw new ApiError('Only owner or admin can remove members', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    const member = await db.teamMember.findUnique({
        where: { id: memberId },
        select: { teamId: true, userId: true, role: true },
    });

    if (!member || member.teamId !== teamId) {
        throw new ApiError('Member not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Admin cannot remove other admins
    if (!isOwner && member.role === TeamRole.ADMIN) {
        throw new ApiError('Only owner can remove admins', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    // Cannot remove yourself if you're admin (must leave or owner removes)
    if (member.userId === userId && isAdmin) {
        throw new ApiError('Use leave endpoint to leave the team', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    await db.teamMember.delete({ where: { id: memberId } });

    return sendSuccess(reply, { deleted: true }, 'Member removed successfully');
};

/**
 * Leave a team.
 * Any member can leave. Owner cannot leave (must delete team or transfer ownership).
 */
export const leaveTeam = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { teamId } = req.params as TeamIdParamInput;
    const userId = req.user!.id;

    const team = await db.team.findUnique({
        where: { id: teamId },
        select: { ownerId: true },
    });

    if (!team) {
        throw new ApiError('Team not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (team.ownerId === userId) {
        throw new ApiError('Owner cannot leave the team. Delete it or transfer ownership.', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const membership = await db.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId } },
    });

    if (!membership) {
        throw new ApiError('You are not a member of this team', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    await db.teamMember.delete({ where: { id: membership.id } });

    return sendSuccess(reply, { left: true }, 'Left team successfully');
};
