import { db } from '#lib/database/connection';
import { RoleType, ActorType, EntityType } from '@prisma/client';

export const getRole = async (actorId: string, entityId: string): Promise<RoleType | undefined> => {
    const perm = await db.permission.findUnique({
        where: {
            actorId_entityId: {
                actorId,
                entityId,
            },
        },
        select: {
            role: true,
            // can select more like: id, createdAt, updatedAt, types of a actors and so on...
        },
    });

    return perm?.role;
};

/**
 * Get role with permission inheritance.
 * Checks direct permission first, then traverses up the parent chain.
 * Only checks USER actor type and BLOCK entity type.
 */
export const getRoleWithInheritance = async (userId: string, blockId: string): Promise<RoleType | undefined> => {
    // first, try the direct permission (fast path)
    const directPermission = await db.permission.findUnique({
        where: {
            actorId_entityId: {
                actorId: userId,
                entityId: blockId,
            },
        },
        select: { role: true },
    });

    if (directPermission) {
        return directPermission.role;
    }

    // use a recursive CTE to fetch the block and all its ancestors in one go,
    // ordered by distance from the original block (closest first)
    const rows = await db.$queryRaw<Array<{ role: RoleType | null }>>`
        WITH RECURSIVE ancestors AS (
            SELECT id, parent_id, 0 AS depth
            FROM blocks
            WHERE id = ${blockId}::uuid
            UNION ALL
            SELECT b.id, b.parent_id, a.depth + 1
            FROM blocks b
            INNER JOIN ancestors a ON b.id = a.parent_id
        )
        SELECT p.role
        FROM ancestors a
        JOIN permissions p
          ON p.entity_id = a.id
         AND p.actor_id = ${userId}::uuid
         AND p.actor_type = ${ActorType.USER}
         AND p.entity_type = ${EntityType.BLOCK}
        ORDER BY a.depth ASC
        LIMIT 1
    `;

    const first = rows[0];
    if (first?.role != null) {
        return first.role as RoleType;
    }

    return undefined;
};
