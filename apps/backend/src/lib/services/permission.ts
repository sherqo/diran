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
    // check if user has direct permission
    const directPermission = await db.permission.findUnique({
        where: {
            actorId_entityId: {
                actorId: userId,
                entityId: blockId,
            },
            actorType: ActorType.USER,
            entityType: EntityType.BLOCK,
        },
        select: {
            role: true,
        },
    });

    if (directPermission) {
        return directPermission.role;
    }

    // if no direct permission, traverse up the parent chain
    let currentBlock = await db.block.findUnique({
        where: { id: blockId },
        select: { parentId: true },
    });

    while (currentBlock?.parentId) {
        const parentPermission = await db.permission.findUnique({
            where: {
                actorId_entityId: {
                    actorId: userId,
                    entityId: currentBlock.parentId,
                },
                actorType: ActorType.USER,
                entityType: EntityType.BLOCK,
            },
            select: {
                role: true,
            },
        });

        if (parentPermission) {
            return parentPermission.role;
        }

        // move to the next parent
        currentBlock = await db.block.findUnique({
            where: { id: currentBlock.parentId },
            select: { parentId: true },
        });
    }

    // no permission found
    return undefined;
};
