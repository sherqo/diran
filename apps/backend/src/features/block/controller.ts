import { Response } from 'express';
import { AuthenticatedRequest } from '#lib/middleware/auth';
import { CreateBlockBodyInput, GetBlockParamInput, UpdateBlockParamInput, DeleteBlockParamInput } from '@diran/shared/validation/blocks';
import { db } from '#lib/database/connection';
import { sendSuccess } from '#lib/utils/response';
import { ApiError } from '#lib/middleware/errorHandler';
import { ErrorCode, HttpStatus } from '@diran/shared/constants/errors';
import { ActorType, EntityType, RoleType } from '@prisma/client';

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

    // TODO: check on the order uniqueness under the same parentId

    const { type, parentId, order, content } = req.body as CreateBlockBodyInput; // all basic validation are already done

    // Creating the block
    const created = await db.block.create({
        data: {
            type,
            parentId: parentId ?? null,
            order,
            content, // THE TYPE, i'm just, AHHHH >_<
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

    // Assinging the permission to the creator as OWNER
    const perm = await db.permission.create({
        data: {
            actorId: req.user!.id,
            actorType: ActorType.USER,
            entityId: created.id,
            entityType: EntityType.BLOCK,
            role: RoleType.OWNER,
        },
    });

    if (!perm) {
        // my db bill sucks :(
        await db.block.delete({ where: { id: created.id } });
        throw new ApiError(
            'Failed to assign permission to the block creator',
            HttpStatus.INTERNAL_SERVER_ERROR,
            ErrorCode.PERMISSION_ASSIGNMENT_FAILED
        );
    }

    const data = { block };
    sendSuccess(res, data, 'Block created successfully', HttpStatus.CREATED);
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
