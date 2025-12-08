import { FastifyReply } from 'fastify';
import { db } from '#lib/database/connection.js';
import { AuthenticatedRequest } from '#lib/middleware/auth.js';
import { sendSuccess } from '#lib/utils/response.js';
import { ApiError } from '#lib/middleware/errorHandler.js';
import { HttpStatus, ErrorCode } from '@diran/shared/constants/errors.js';
import { TeamIdParamInput, CreateTeamBodyInput, UpdateTeamBodyInput, CreateTeamPageBodyInput } from '@diran/shared/validation/team.js';
import { TeamResponse, TeamDetailResponse } from '@diran/shared/types/team.js';
import { RoleType, BlockType } from '@prisma/client';
import { generateKeyBetween } from 'fractional-indexing';

/**
 * Format team response with owner info.
 */
const formatTeamResponse = (team: any): TeamResponse => ({
    id: team.id,
    name: team.name,
    owner: {
        id: team.owner.id,
        name: team.owner.name,
        email: team.owner.email,
        photo: team.owner.photo,
    },
    memberCount: team._count?.members ?? 0,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
});

/**
 * Format team detail response with members.
 */
const formatTeamDetailResponse = (team: any): TeamDetailResponse => ({
    ...formatTeamResponse(team),
    members: team.members.map((m: any) => ({
        id: m.id,
        user: {
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            photo: m.user.photo,
        },
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
    })),
});

/**
 * List all teams the user is part of (owner or member).
 */
export const listTeams = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user!.id;

    const teams = await db.team.findMany({
        where: {
            OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
        include: {
            owner: {
                select: { id: true, name: true, email: true, photo: true },
            },
            _count: { select: { members: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(reply, { teams: teams.map(formatTeamResponse) }, 'Teams retrieved successfully');
};

/**
 * Get team details with members.
 * Requires: user is owner or member.
 */
export const getTeam = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { teamId } = req.params as TeamIdParamInput;
    const userId = req.user!.id;

    const team = await db.team.findUnique({
        where: { id: teamId },
        include: {
            owner: {
                select: { id: true, name: true, email: true, photo: true },
            },
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, photo: true },
                    },
                },
                orderBy: { joinedAt: 'asc' },
            },
            _count: { select: { members: true } },
        },
    });

    if (!team) {
        throw new ApiError('Team not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Check access: must be owner or member
    const isMember = team.members.some(m => m.userId === userId);
    if (team.ownerId !== userId && !isMember) {
        throw new ApiError('Access denied', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    return sendSuccess(reply, { team: formatTeamDetailResponse(team) }, 'Team retrieved successfully');
};

/**
 * Create a new team.
 * User becomes the owner.
 */
export const createTeam = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user!.id;
    const { name } = req.body as CreateTeamBodyInput;

    const team = await db.team.create({
        data: {
            name,
            ownerId: userId,
        },
        include: {
            owner: {
                select: { id: true, name: true, email: true, photo: true },
            },
            _count: { select: { members: true } },
        },
    });

    return sendSuccess(reply, { team: formatTeamResponse(team) }, 'Team created successfully', HttpStatus.CREATED);
};

/**
 * Update team info.
 * Requires: OWNER only.
 */
export const updateTeam = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { teamId } = req.params as TeamIdParamInput;
    const userId = req.user!.id;
    const { name } = req.body as UpdateTeamBodyInput;

    const team = await db.team.findUnique({ where: { id: teamId } });

    if (!team) {
        throw new ApiError('Team not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (team.ownerId !== userId) {
        throw new ApiError('Only the owner can update team info', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    const updated = await db.team.update({
        where: { id: teamId },
        data: { name },
        include: {
            owner: {
                select: { id: true, name: true, email: true, photo: true },
            },
            _count: { select: { members: true } },
        },
    });

    return sendSuccess(reply, { team: formatTeamResponse(updated) }, 'Team updated successfully');
};

/**
 * Delete a team.
 * Requires: OWNER only.
 */
export const deleteTeam = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { teamId } = req.params as TeamIdParamInput;
    const userId = req.user!.id;

    const team = await db.team.findUnique({ where: { id: teamId } });

    if (!team) {
        throw new ApiError('Team not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (team.ownerId !== userId) {
        throw new ApiError('Only the owner can delete the team', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    await db.team.delete({ where: { id: teamId } });

    return sendSuccess(reply, { deleted: true }, 'Team deleted successfully');
};

/**
 * Get pages owned by a team.
 * Requires: user is owner or member.
 */
export const getTeamPages = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { teamId } = req.params as TeamIdParamInput;
    const userId = req.user!.id;

    // Check team exists and user has access
    const team = await db.team.findUnique({
        where: { id: teamId },
        include: {
            members: { select: { userId: true } },
        },
    });

    if (!team) {
        throw new ApiError('Team not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const isMember = team.members.some(m => m.userId === userId);
    if (team.ownerId !== userId && !isMember) {
        throw new ApiError('Access denied', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    // Get pages OWNED by this team (role = OWNER)
    const pages = await db.$queryRaw<
        Array<{
            id: string;
            type: string;
            content: any;
            order: string;
            createdAt: Date;
            updatedAt: Date;
        }>
    >`
        SELECT 
            b.id,
            b.type,
            b.content,
            b."order",
            b.created_at as "createdAt",
            b.updated_at as "updatedAt"
        FROM blocks b
        INNER JOIN permissions p ON p.block_id = b.id
        WHERE 
            b.type::text = 'page'
            AND b.parent_id IS NULL
            AND p.team_id = ${teamId}::uuid
            AND p.role = 'OWNER'
        ORDER BY b."order" ASC
    `;

    const transformedPages = pages.map(page => ({
        id: page.id,
        type: page.type,
        content: page.content,
        order: page.order,
        createdAt: new Date(page.createdAt).toISOString(),
        updatedAt: new Date(page.updatedAt).toISOString(),
    }));

    return sendSuccess(reply, { pages: transformedPages, teamId }, 'Team pages retrieved successfully');
};

/**
 * Create a new page owned by the team.
 * Requires: user is owner or admin.
 */
export const createTeamPage = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { teamId } = req.params as TeamIdParamInput;
    const userId = req.user!.id;
    const { title, icon } = req.body as CreateTeamPageBodyInput;

    // Check team exists and user can create pages (owner or admin)
    const team = await db.team.findUnique({
        where: { id: teamId },
        include: {
            members: {
                where: { userId },
                select: { role: true },
            },
        },
    });

    if (!team) {
        throw new ApiError('Team not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const isOwner = team.ownerId === userId;
    const memberRole = team.members[0]?.role;
    const isAdmin = memberRole === 'ADMIN';

    // Only owner or admin can create team pages
    if (!isOwner && !isAdmin) {
        throw new ApiError('Only team owner or admin can create team pages', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    const result = await db.$transaction(async tx => {
        // Create the page block
        const page = await tx.block.create({
            data: {
                type: BlockType.page,
                parentId: null,
                order: generateKeyBetween(null, null),
                content: {
                    title: title || 'Untitled',
                    ...(icon && { icon }),
                },
            },
            select: {
                id: true,
                type: true,
                parentId: true,
                order: true,
                content: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // Create permission with TEAM as owner
        await tx.permission.create({
            data: {
                teamId,
                blockId: page.id,
                role: RoleType.OWNER,
            },
        });

        // Create default empty paragraph as first child
        await tx.block.create({
            data: {
                type: BlockType.paragraph,
                parentId: page.id,
                order: generateKeyBetween(null, null),
                content: [],
            },
        });

        return {
            id: page.id,
            type: page.type,
            parentId: page.parentId,
            order: page.order,
            content: page.content,
            createdAt: page.createdAt.toISOString(),
            updatedAt: page.updatedAt.toISOString(),
        };
    });

    return sendSuccess(reply, { page: result, teamId }, 'Team page created successfully', HttpStatus.CREATED);
};
