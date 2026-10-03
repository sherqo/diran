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

// CREATE core — shared by POST /block and POST /block/bulk.
// Must run inside a transaction (caller provides tx).
export async function createBlockRecord(tx: BlockTransaction, userId: string, input: CreateBlockBodyInput): Promise<BlockRecord> {
    const { id, type, content, parentId, prevId, nextId } = input;

    // Fetch prev and next block orders if IDs are provided
    const prevOrder = prevId ? ((await tx.block.findUnique({ where: { id: prevId }, select: { order: true } }))?.order ?? null) : null;
    const nextOrder = nextId ? ((await tx.block.findUnique({ where: { id: nextId }, select: { order: true } }))?.order ?? null) : null;

    // Generate order between prev and next (handles nulls for first/last positions)
    const order = generateKeyBetween(prevOrder, nextOrder);

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

    // Check permission on new parent if parentId is being changed
    if ('parentId' in payload && payload.parentId !== existing.parentId) {
        const newParentId = payload.parentId;

        // If moving to a new parent (not making it a root), check write permission on new parent
        if (newParentId) {
            const role = await getRoleWithInheritance(userId, newParentId);

            if (!role || role === RoleType.NONE || !canWrite(role)) {
                throw new ApiError(
                    'Access denied: No write permission on new parent block',
                    HttpStatus.FORBIDDEN,
                    ErrorCode.PERMISSION_DENIED
                );
            }
        }
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

    // Handle parentId (null is valid)
    if ('parentId' in payload) {
        dataToUpdate.parentId = payload.parentId ?? null;
    }

    // Handle order changes (moving blocks)
    if ('prevId' in payload || 'nextId' in payload) {
        const [prevBlock, nextBlock] = await Promise.all([
            payload.prevId ? tx.block.findUnique({ where: { id: payload.prevId }, select: { order: true } }) : null,
            payload.nextId ? tx.block.findUnique({ where: { id: payload.nextId }, select: { order: true } }) : null,
        ]);

        const prevOrder = prevBlock?.order ?? null;
        const nextOrder = nextBlock?.order ?? null;
        dataToUpdate.order = generateKeyBetween(prevOrder, nextOrder);
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

            UNION ALL

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
