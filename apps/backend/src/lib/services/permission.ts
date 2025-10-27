import { db } from '#lib/database/connection';
import { RoleType } from '@prisma/client';

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
        },
    });

    return perm?.role;
};
