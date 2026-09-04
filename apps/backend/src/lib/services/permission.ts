import { db } from '../database/connection.js';
import { RoleType } from '@prisma/client';

/**
 * Role priority for resolving conflicts (higher = more access).
 */
const ROLE_PRIORITY: Record<RoleType, number> = {
    OWNER: 4,
    EDITOR: 3,
    VIEWER: 2,
    NONE: 0,
};

/**
 * Get the higher role between two roles.
 */
const getHigherRole = (a: RoleType | undefined, b: RoleType | undefined): RoleType | undefined => {
    if (!a) return b;
    if (!b) return a;
    return ROLE_PRIORITY[a] >= ROLE_PRIORITY[b] ? a : b;
};

export const getRole = async (userId: string, blockId: string): Promise<RoleType | undefined> => {
    const perm = await db.permission.findUnique({
        where: {
            userId_blockId: {
                userId,
                blockId,
            },
        },
        select: {
            role: true,
        },
    });

    return perm?.role;
};

/**
 * Get user's team IDs (teams they own or are members of).
 */
export const getUserTeamIds = async (userId: string): Promise<string[]> => {
    const rows = await db.$queryRaw<Array<{ id: string }>>`
        SELECT t.id
        FROM teams t
        WHERE t.owner_id = ${userId}::uuid
        UNION
        SELECT tm.team_id as id
        FROM team_members tm
        WHERE tm.user_id = ${userId}::uuid
    `;
    return rows.map(r => r.id);
};

/**
 * Get role with permission inheritance.
 * Checks direct user permission first, then team permissions, then traverses up the parent chain.
 * Returns the highest role found between user and team permissions.
 */
export const getRoleWithInheritance = async (userId: string, blockId: string): Promise<RoleType | undefined> => {
    // First, try the direct user permission (fast path)
    const directPermission = await db.permission.findUnique({
        where: {
            userId_blockId: {
                userId,
                blockId,
            },
        },
        select: { role: true },
    });

    if (directPermission?.role === RoleType.OWNER) {
        // Owner is the highest, no need to check further
        return RoleType.OWNER;
    }

    // Get user's team IDs
    const teamIds = await getUserTeamIds(userId);

    // Check direct team permission on this block
    let teamRole: RoleType | undefined;
    if (teamIds.length > 0) {
        const teamPermissions = await db.permission.findMany({
            where: {
                blockId,
                teamId: { in: teamIds },
            },
            select: { role: true },
        });

        for (const tp of teamPermissions) {
            teamRole = getHigherRole(teamRole, tp.role);
        }
    }

    // If we have direct permissions, combine them
    const directRole = getHigherRole(directPermission?.role, teamRole);
    if (directRole) {
        return directRole;
    }

    // No direct permission, check inheritance via parent chain
    // Build a single query that checks both user and team permissions
    const rows = await db.$queryRaw<Array<{ depth: number; role: RoleType }>>`
        WITH RECURSIVE ancestors AS (
            SELECT id, parent_id, 0 AS depth
            FROM blocks
            WHERE id = ${blockId}::uuid
            UNION ALL
            SELECT b.id, b.parent_id, a.depth + 1
            FROM blocks b
            INNER JOIN ancestors a ON b.id = a.parent_id
        )
        SELECT a.depth, p.role
        FROM ancestors a
        JOIN permissions p ON p.block_id = a.id
        WHERE p.user_id = ${userId}::uuid
           OR (${teamIds.length > 0} AND p.team_id = ANY(${teamIds}::uuid[]))
        ORDER BY a.depth ASC
    `;

    if (rows.length === 0) {
        return undefined;
    }

    // Get the highest role at the closest depth
    const minDepth = rows[0]?.depth || 0;
    let result: RoleType | undefined;

    for (const perm of rows) {
        if (perm.depth > minDepth) break;
        result = getHigherRole(result, perm.role);
    }

    return result;
};
