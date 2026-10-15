import { BlockType, RoleType } from '@prisma/client';
import { db } from '#lib/database/connection.js';
import { createBlockRecord } from '#features/block/service.js';
import type { CreateBlockBodyInput } from '@diran/shared/validation/block.js';

export { db };

export const resetDb = async (): Promise<void> => {
    await db.$executeRawUnsafe('TRUNCATE users, blocks, permissions, publish, teams, team_members, waitlist CASCADE');
};

let userCount = 0;
export const createUser = async (): Promise<string> => {
    userCount++;
    const user = await db.user.create({
        data: { email: `user${userCount}@test.local`, password: 'x', name: `User ${userCount}`, emailVerified: true },
    });
    return user.id;
};

export const createBlock = async (userId: string, input: Omit<CreateBlockBodyInput, 'type' | 'content'> & { type?: BlockType }) => {
    return db.$transaction(tx =>
        createBlockRecord(tx, userId, { type: BlockType.paragraph, content: {}, ...input } as CreateBlockBodyInput)
    );
};

// A root page owned by `userId`, with its default first paragraph removed so
// tests start from an empty child list.
export const createPage = async (userId: string): Promise<string> => {
    const page = await createBlock(userId, { type: BlockType.page });
    await db.block.deleteMany({ where: { parentId: page.id } });
    return page.id;
};

export const share = async (userId: string, blockId: string, role: RoleType): Promise<void> => {
    await db.permission.create({ data: { userId, blockId, role } });
};

// Children ids in display order (byte-wise key order, as fractional-indexing expects).
export const childIds = async (parentId: string): Promise<string[]> => {
    const rows = await db.block.findMany({ where: { parentId }, select: { id: true, order: true } });
    return rows.sort((a, b) => (a.order < b.order ? -1 : a.order > b.order ? 1 : 0)).map(r => r.id);
};
