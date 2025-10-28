import { Response } from 'express';
import { AuthenticatedRequest } from '#lib/middleware/auth';
import { CreateBlockBodyInput, GetBlockParamInput, UpdateBlockParamInput, DeleteBlockParamInput } from '@diran/shared/validation/blocks';
import { db } from '#lib/database/connection';
import { sendSuccess } from '#lib/utils/response';
import { ApiError } from '#lib/middleware/errorHandler';
import { ErrorCode, HttpStatus } from '@diran/shared/constants/errors';
import { BlockType, ActorType, EntityType, RoleType } from '@prisma/client';

// CREATE
const createBlock = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    /**
     * how do we create a block?
     * ok look:
     * - the user has two type of blocks: PAGE and non-PAGE
     * -- if PAGE, then parentId is not required and NO permission is needed
     * NOTE: I will manage the permission somewhere else...
     * -- if non-PAGE, then parentId is required
     *
     * any data comes to this function, i'm sure the user has the permission to do it!
     *
     * for the order, idk, but let the client set it manually,
     * what if the block has the same order? will be too complex
     * for now just throw an expection
     *
     * i wanna be nice, i'm a nice man, i'm nice :)
     */

    // TODO: check on the order uniqueness under the same parentId, done by the DB, just check the error and throw a proper one
    // Your Creation just sucks, what is the difference between creating pages or blocks? where to add to the db
    // should we even still treat pages as blocks? yes
    // how to handle permissions for both creation pages or blocks? no permissoin for blocks, pages only for now
    // how do you check the parentId validity? i think handled by the foreign key in the db
    // a lot of Qs here, just do not suck!!
    // the perm depending on who?? being page or not? or having parentId or not?
    // imagine a page inside a page and wanna move the inner page, how to handle that? FOCUSSSSS

    /**
     * the options:
     *   1. adding a page with no parent, no permission needed, add permission to the creator as OWNER
     *   2. adding a page with a parent, permission needed on the parent, no permission will added to the new page
     *   3. adding a block with a parent, permission needed on the parent, no permission will added to the new block
     *
     * so, simply:
     *    - if the block (or page) has a parentId, no permission row (inherited)
     *    - if the block is a PAGE and has no parentId, add permission to the creator as OWNER (can be shared as well)
     */

    /**
     * i am sure if the type is not PAGE, parentId is defined
     * so, if the type is PAGE, we should check if parentId is defined or not
     */

    const { type, parentId, order, content } = req.body as CreateBlockBodyInput;

    try {
        const result = await db.$transaction(async tx => {
            // Creating the block with creatorId
            const created = await tx.block.create({
                data: {
                    type,
                    parentId: parentId ?? null,
                    order,
                    content,
                    // creatorId: req.user!.id, // we may add it later
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

            const block = {
                id: created.id,
                type: created.type,
                parentId: created.parentId,
                order: created.order,
                content: created.content,
                createdAt: created.createdAt.toISOString(),
                updatedAt: created.updatedAt.toISOString(),
            };

            const needsPermissionAssignment = type === BlockType.PAGE && !parentId;

            if (needsPermissionAssignment) {
                // Create permission within the same transaction
                await tx.permission.create({
                    data: {
                        actorId: req.user!.id,
                        actorType: ActorType.USER,
                        entityId: created.id,
                        entityType: EntityType.BLOCK,
                        role: RoleType.OWNER,
                    },
                });
            }

            return { block, needsPermissionAssignment };
        });

        const message = result.needsPermissionAssignment ? 'Parent block created successfully' : 'Children block created successfully';

        sendSuccess(res, { block: result.block }, message, HttpStatus.CREATED);
    } catch (error: any) {
        // Handle specific database errors
        if (error.code === 'P2002' && error.meta?.target?.includes('order')) {
            throw new ApiError('A block with this order already exists in the same parent', HttpStatus.CONFLICT, ErrorCode.DUPLICATE_ORDER);
        }

        if (error.code === 'P2003' && error.meta?.field_name === 'parentId') {
            throw new ApiError('Parent block not found', HttpStatus.BAD_REQUEST, ErrorCode.INVALID_PARENT_ID);
        }

        throw new ApiError('Failed to create block', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.DATABASE_ERROR);
    }
};

// ====== Just placeholder(s) for now ======

// READ
const getBlock = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params as GetBlockParamInput;

    const found = await db.block.findUnique({
        where: { id },
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

    if (!found) {
        throw new ApiError('Block not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const block = {
        id: found.id,
        type: found.type,
        parentId: found.parentId,
        order: found.order,
        content: found.content,
        createdAt: found.createdAt.toISOString(),
        updatedAt: found.updatedAt.toISOString(),
    };

    const data = { block };
    sendSuccess(res, data);
};

// UPDATE --
const updateBlock = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const payload = req.body as Partial<UpdateBlockParamInput>;

    const existing = await db.block.findUnique({ where: { id } });
    if (!existing) {
        throw new ApiError('Block not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Only include defined fields
    const dataToUpdate = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

    // Handle parentId separately because null is valid
    if ('parentId' in payload) {
        dataToUpdate.parentId = payload.parentId ?? null;
    }

    const updated = await db.block.update({
        where: { id },
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

    sendSuccess(
        res,
        {
            block: {
                ...updated,
                createdAt: updated.createdAt.toISOString(),
                updatedAt: updated.updatedAt.toISOString(),
            },
        },
        'Block updated successfully'
    );
};

// DELETE
const deleteBlock = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params as DeleteBlockParamInput;

    const block = await db.block.findUnique({ where: { id } });
    if (!block) {
        throw new ApiError('Block not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await db.block.delete({ where: { id } });

    sendSuccess(res, {}, 'Block deleted successfully');
};

export { createBlock, getBlock, updateBlock, deleteBlock };
