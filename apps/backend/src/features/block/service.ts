import { Prisma, BlockType, RoleType } from '@prisma/client';
import { generateKeyBetween } from 'fractional-indexing';
import { extractPlainTextFromContent } from '#lib/utils/content.js';
import { getRoleWithInheritance } from '#lib/services/permission.js';
import { canWrite } from '#features/block/middlewares.js';
import { ApiError } from '#lib/middleware/errorHandler.js';
import { ErrorCode, HttpStatus } from '@diran/shared/constants/errors.js';
import type { CreateBlockBodyInput, UpdateBlockBodyInput } from '@diran/shared/validation/block.js';

export type BlockTransaction = Prisma.TransactionClient;

export interface BlockRecord {
    id: string;
    type: string;
    parentId: string | null;
    order: string;
    content: unknown;
    createdAt: string;
    updatedAt: string;
}

const toRecord = (row: {
    id: string;
    type: string;
    parentId: string | null;
    order: string;
    content: unknown;
    createdAt: Date;
    updatedAt: Date;
}): BlockRecord => ({
    id: row.id,
    type: row.type,
    parentId: row.parentId,
    order: row.order,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
});

const getOrder = async (tx: BlockTransaction, id: string | null | undefined): Promise<string | null> =>
    id ? ((await tx.block.findUnique({ where: { id }, select: { order: true } }))?.order ?? null) : null;

// Order of the first sibling after `after` (or the first sibling at all when null).
// COLLATE "C": fractional-indexing keys must compare byte by byte, not by locale.
const siblingOrderAfter = async (tx: BlockTransaction, parentId: string, after: string | null, selfId: string | null) => {
    const rows = await tx.$queryRaw<Array<{ order: string }>>`
        SELECT "order" FROM blocks
        WHERE parent_id = ${parentId}::uuid
          AND id IS DISTINCT FROM ${selfId}::uuid
          AND (${after}::text IS NULL OR "order" COLLATE "C" > ${after})
        ORDER BY "order" COLLATE "C" ASC
        LIMIT 1
    `;
    return rows[0]?.order ?? null;
};

// Order of the last sibling before `before` (or the last sibling at all when null).
const siblingOrderBefore = async (tx: BlockTransaction, parentId: string, before: string | null, selfId: string | null) => {
    const rows = await tx.$queryRaw<Array<{ order: string }>>`
        SELECT "order" FROM blocks
        WHERE parent_id = ${parentId}::uuid
          AND id IS DISTINCT FROM ${selfId}::uuid
          AND (${before}::text IS NULL OR "order" COLLATE "C" < ${before})
        ORDER BY "order" COLLATE "C" DESC
        LIMIT 1
    `;
    return rows[0]?.order ?? null;
};

/**
 * Order key for a block placed after `prevId` / before `nextId` under `parentId`.
 *
 * The client's neighbours may not exist yet (a paste sends all pasted blocks in
 * one bulk, each pointing at the next one), so we trust one neighbour and read
 * the real other one from the database. `selfId` is the block being moved.
 */
async function orderForPosition(
    tx: BlockTransaction,
    parentId: string | null,
    prevId: string | null | undefined,
    nextId: string | null | undefined,
    selfId: string | null = null
): Promise<string> {
    // Root pages share no parent; the client sends neighbours from the user's own page list.
    if (!parentId) {
        return generateKeyBetween(await getOrder(tx, prevId), await getOrder(tx, nextId));
    }

    const siblingOrder = async (id: string | null | undefined) =>
        id && id !== selfId ? ((await tx.block.findFirst({ where: { id, parentId }, select: { order: true } }))?.order ?? null) : null;

    const prevOrder = await siblingOrder(prevId);
    if (prevOrder !== null) {
        return generateKeyBetween(prevOrder, await siblingOrderAfter(tx, parentId, prevOrder, selfId));
    }

    const nextOrder = await siblingOrder(nextId);
    if (nextOrder !== null) {
        return generateKeyBetween(await siblingOrderBefore(tx, parentId, nextOrder, selfId), nextOrder);
    }

    // No usable neighbour: no prevId means "first", otherwise append at the end.
    if (!prevId) {
        return generateKeyBetween(null, await siblingOrderAfter(tx, parentId, null, selfId));
    }
    return generateKeyBetween(await siblingOrderBefore(tx, parentId, null, selfId), null);
}

// `blockId` and all its ancestors. UNION (not UNION ALL) also stops on a cycle
// left in old data. Empty when the block does not exist.
const getAncestors = (tx: BlockTransaction, blockId: string) => tx.$queryRaw<Array<{ id: string; parentId: string | null }>>`
    WITH RECURSIVE up AS (
        SELECT id, parent_id FROM blocks WHERE id = ${blockId}::uuid
        UNION
        SELECT b.id, b.parent_id FROM blocks b INNER JOIN up ON b.id = up.parent_id
    )
    SELECT id, parent_id AS "parentId" FROM up
`;

const rootOf = (ancestors: Array<{ id: string; parentId: string | null }>) => ancestors.find(a => !a.parentId)?.id;

/**
 * Rules for giving a block a new parent:
 * - the new parent must exist and must not be the block itself or inside it
 * - the user needs write access on the new parent
 * - moving to the top level or into another page tree changes who owns the
 *   block, so only the block's owner may do that
 */
async function checkNewParent(tx: BlockTransaction, userId: string, blockId: string, newParentId: string | null): Promise<void> {
    const isOwner = (await getRoleWithInheritance(userId, blockId, tx)) === RoleType.OWNER;

    if (!newParentId) {
        if (!isOwner) {
            throw new ApiError('Only the owner can move a block to the top level', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
        }
        return;
    }

    const parentAncestors = await getAncestors(tx, newParentId);
    if (parentAncestors.length === 0) {
        throw new ApiError('New parent block not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    if (parentAncestors.some(a => a.id === blockId)) {
        throw new ApiError('Cannot move a block inside itself', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const parentRole = await getRoleWithInheritance(userId, newParentId, tx);
    if (!parentRole || !canWrite(parentRole)) {
        throw new ApiError('Access denied: No write permission on new parent block', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }

    const sameTree = rootOf(parentAncestors) === rootOf(await getAncestors(tx, blockId));
    if (!sameTree && !isOwner) {
        throw new ApiError('Only the owner can move a block to another page', HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED);
    }
}

// CREATE core — shared by POST /block and POST /block/bulk.
// Must run inside a transaction (caller provides tx).
export async function createBlockRecord(tx: BlockTransaction, userId: string, input: CreateBlockBodyInput): Promise<BlockRecord> {
    const { id, type, content, parentId, prevId, nextId } = input;

    const order = await orderForPosition(tx, parentId ?? null, prevId, nextId);

    // Extract plain text for search indexing
    const contentText = extractPlainTextFromContent(content);

    // Create the block
    const created = await tx.block.create({
        data: {
            ...(id && { id }), // Only include id if it exists
            type: type as BlockType,
            parentId: parentId ?? null,
            order,
            content,
            contentText: contentText || null,
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

    // only the page with no parent
    if (!parentId) {
        await tx.permission.create({
            data: {
                userId,
                blockId: created.id,
                role: RoleType.OWNER,
            },
        });
    }

    // If creating a PAGE, also create a default empty paragraph block as first child
    if (type === BlockType.page) {
        await tx.block.create({
            data: {
                type: BlockType.paragraph,
                parentId: created.id,
                order: generateKeyBetween(null, null),
                content: [],
            },
        });
    }

    return toRecord(created);
}

// UPDATE core — shared by PUT /block/:id and POST /block/bulk.
// Includes the new-parent permission check. Must run inside a transaction.
export async function updateBlockRecord(
    tx: BlockTransaction,
    userId: string,
    blockId: string,
    payload: Partial<UpdateBlockBodyInput>
): Promise<BlockRecord> {
    const existing = await tx.block.findUnique({ where: { id: blockId } });
    if (!existing) {
        throw new ApiError('Block not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const parentId = 'parentId' in payload ? (payload.parentId ?? null) : existing.parentId;
    const parentChanged = parentId !== existing.parentId;

    if (parentChanged) {
        await checkNewParent(tx, userId, blockId, parentId);
    }

    // Prepare update data
    const dataToUpdate: any = {};

    // Handle basic fields
    if (payload.type !== undefined) dataToUpdate.type = payload.type;
    if (payload.content !== undefined) {
        dataToUpdate.content = payload.content;
        // Update content_text for search indexing
        dataToUpdate.contentText = extractPlainTextFromContent(payload.content) || null;
    }

    if (parentChanged) {
        dataToUpdate.parentId = parentId;
    }

    // Moving: a new parent always needs a new order, its siblings may already use the old one
    if (parentChanged || 'prevId' in payload || 'nextId' in payload) {
        dataToUpdate.order = await orderForPosition(tx, parentId, payload.prevId, payload.nextId, blockId);
    }

    // Perform the update
    const updated = await tx.block.update({
        where: { id: blockId },
        data: dataToUpdate,
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

    // At the top level there is no parent to inherit from, so keep the block with its owner
    if (parentChanged && !parentId) {
        await tx.permission.upsert({
            where: { userId_blockId: { userId, blockId } },
            update: { role: RoleType.OWNER },
            create: { userId, blockId, role: RoleType.OWNER },
        });
    }

    return toRecord(updated);
}

// DELETE core — shared by DELETE /block/:id and POST /block/bulk.
// Removes the block and all its children recursively (cascade delete).
export async function deleteBlockRecord(tx: BlockTransaction, blockId: string): Promise<void> {
    const block = await tx.block.findUnique({ where: { id: blockId } });
    if (!block) {
        throw new ApiError('Block not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Use recursive CTE to get all descendants in a single query
    const allBlockIds: string[] = await tx.$queryRaw`
        WITH RECURSIVE descendants AS (
            -- Base case: the block we want to delete
            SELECT id FROM blocks WHERE id = ${blockId}::uuid

            -- UNION (not UNION ALL) so a cycle left in old data cannot loop forever
            UNION

            -- Recursive case: children of blocks we've already found
            SELECT b.id
            FROM blocks b
            INNER JOIN descendants d ON b.parent_id = d.id
        )
        SELECT id FROM descendants
    `;

    const blockIds = allBlockIds.map((row: any) => row.id);

    // Delete blocks - permissions will cascade delete automatically
    await tx.block.deleteMany({
        where: { id: { in: blockIds } },
    });
}
