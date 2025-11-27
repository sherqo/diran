import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '#lib/middleware/auth';
import { CreateBlockBodyInput, GetBlockParamInput, UpdateBlockParamInput, DeleteBlockParamInput } from '@diran/shared/validation/block';
import { db } from '#lib/database/connection';
import { sendSuccess } from '#lib/utils/response';
import { ApiError } from '#lib/middleware/errorHandler';
import { ErrorCode, HttpStatus } from '@diran/shared/constants/errors';
import { BlockType, ActorType, EntityType, RoleType } from '@prisma/client';
import { generateKeyBetween } from 'fractional-indexing';

// CREATE
// const createBlock = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
//     /**
//      * how do we create a block?
//      * ok look:
//      * - the user has two type of blocks: PAGE and non-PAGE
//      * -- if PAGE, then parentId is not required and NO permission is needed
//      * NOTE: I will manage the permission somewhere else...
//      * -- if non-PAGE, then parentId is required
//      *
//      * any data comes to this function, i'm sure the user has the permission to do it!
//      *
//      * what if the block has the same order? will be too complex
//      * for now just throw an expection
//      *
//      * i wanna be nice, i'm a nice man, i'm nice :)
//      */

//     // TODO: check on the order uniqueness under the same parentId, done by the DB, just check the error and throw a proper one
//     // Your Creation just sucks, what is the difference between creating pages or blocks? where to add to the db
//     // should we even still treat pages as blocks? yes
//     // how to handle permissions for both creation pages or blocks? no permissoin for blocks, pages only for now
//     // how do you check the parentId validity? i think handled by the foreign key in the db
//     // a lot of Qs here, just do not suck!!
//     // the perm depending on who?? being page or not? or having parentId or not?
//     // imagine a page inside a page and wanna move the inner page, how to handle that? FOCUSSSSS

//     /**
//      * the options:
//      *   1. adding a page with no parent, no permission needed, add permission to the creator as OWNER
//      *   2. adding a page with a parent, permission needed on the parent, no permission will added to the new page
//      *   3. adding a block with a parent, permission needed on the parent, no permission will added to the new block
//      *
//      * so, simply:
//      *    - if the block (or page) has a parentId, no permission row (inherited)
//      *    - if the block is a PAGE and has no parentId, add permission to the creator as OWNER (can be shared as well)
//      */

//     /**
//      * i am sure if the type is not PAGE, parentId is defined
//      * so, if the type is PAGE, we should check if parentId is defined or not
//      */

//     // i won't remove any of the comments, they are gold :D

//     const { type, parentId, order, content }: CreateBlockBodyInput = req.body as CreateBlockBodyInput;

//     const result = await db.$transaction(async tx => {
//         // Creating the block
//         const created = await tx.block.create({
//             data: {
//                 type,
//                 parentId: parentId ?? null,
//                 order,
//                 content,
//                 // creatorId: req.user!.id, // TODO: we may need? idk remove it just for now
//             },
//             select: {
//                 id: true,
//                 type: true,
//                 parentId: true,
//                 order: true,
//                 content: true,
//                 createdAt: true,
//                 updatedAt: true,
//             },
//         });

//         const block = {
//             id: created.id,
//             type: created.type,
//             parentId: created.parentId,
//             order: created.order,
//             content: created.content,
//             createdAt: created.createdAt.toISOString(),
//             updatedAt: created.updatedAt.toISOString(),
//         };

//         const needsPermissionAssignment = type === BlockType.PAGE && !parentId;

//         if (needsPermissionAssignment) {
//             await tx.permission.create({
//                 data: {
//                     actorId: req.user!.id,
//                     actorType: ActorType.USER,
//                     entityId: created.id,
//                     entityType: EntityType.BLOCK,
//                     role: RoleType.OWNER,
//                 },
//             });
//         }

//         return { block, needsPermissionAssignment };
//     });

//     const message = result.needsPermissionAssignment ? 'Parent block created successfully' : 'Children block created successfully';

//     sendSuccess(reply, { block: result.block }, message, HttpStatus.CREATED); // TODO: should i return the block?
// };

// TODO: add a service to manage the permissions stuff....
// our new style create function that let the server handle the order generation
const createBlock = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { id, type, content, parentId, prevId, nextId }: CreateBlockBodyInput = req.body as CreateBlockBodyInput;

    const result = await db.$transaction(async tx => {
        // Fetch prev and next block orders if IDs are provided
        const prevOrder = prevId ? ((await tx.block.findUnique({ where: { id: prevId }, select: { order: true } }))?.order ?? null) : null;
        const nextOrder = nextId ? ((await tx.block.findUnique({ where: { id: nextId }, select: { order: true } }))?.order ?? null) : null;

        // Generate order between prev and next (handles nulls for first/last positions)
        const order = generateKeyBetween(prevOrder, nextOrder);

        // Create the block
        const created = await tx.block.create({
            data: {
                ...(id && { id }), // Only include id if it exists
                type,
                parentId: parentId ?? null,
                order,
                content,
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

        const needsPermissionAssignment = type === BlockType.PAGE && !parentId; // only the page with no parent

        if (needsPermissionAssignment) {
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

    const message = result.needsPermissionAssignment ? 'Page created successfully' : 'Block created successfully';

    sendSuccess(reply, { block: result.block }, message, HttpStatus.CREATED);
};

// ====== Just placeholder(s) for now ======

// READ - not implemented yet
const getBlock = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
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
    sendSuccess(reply, data);
};

// UPDATE - not yet implemented
const updateBlock = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
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
        reply,
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

// DELETE - not yet implemented
const deleteBlock = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { id } = req.params as DeleteBlockParamInput;

    const block = await db.block.findUnique({ where: { id } });
    if (!block) {
        throw new ApiError('Block not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await db.block.delete({ where: { id } });

    sendSuccess(reply, {}, 'Block deleted successfully');
};

// TODO: optimize
// GET ALL PAGES - returns all top-level pages the user has access to
const getAllPages = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user!.id;

    // First, get all page IDs where user has permission
    const permissions = await db.permission.findMany({
        where: {
            actorId: userId,
            actorType: ActorType.USER,
            entityType: EntityType.BLOCK,
            role: {
                in: [RoleType.OWNER, RoleType.EDITOR, RoleType.VIEWER],
            },
        },
        select: {
            entityId: true,
            role: true,
        },
    });

    const pageIdsWithRoles = new Map(permissions.map(p => [p.entityId, p.role]));
    const pageIds = Array.from(pageIdsWithRoles.keys());

    // If no permissions found, return empty array
    if (pageIds.length === 0) {
        return sendSuccess(reply, { pages: [] }, 'No pages found');
    }

    // Fetch all top-level pages that user has access to
    const pages = await db.block.findMany({
        where: {
            id: { in: pageIds },
            type: BlockType.PAGE,
            parentId: null,
        },
        select: {
            id: true,
            type: true,
            content: true,
            order: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: {
            order: 'asc',
        },
    });

    // Transform the response and attach roles
    const transformedPages = pages.map(page => ({
        id: page.id,
        type: page.type,
        content: page.content,
        order: page.order,
        role: pageIdsWithRoles.get(page.id),
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
    }));

    return sendSuccess(reply, { length: transformedPages.length, pages: transformedPages }, 'Pages retrieved successfully');
};

export { createBlock, getBlock, updateBlock, deleteBlock, getAllPages };
