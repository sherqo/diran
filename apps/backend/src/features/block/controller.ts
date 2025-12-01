import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '#lib/middleware/auth';
import {
    CreateBlockBodyInput,
    GetBlockParamInput,
    UpdateBlockBodyInput,
    DeleteBlockParamInput,
    UpdateBlockParamInput,
    GetBlockDirectChildrenParamInput,
    GetBlockChildrenTreeInput,
} from '@diran/shared/validation/block';
import { db } from '#lib/database/connection';
import { sendSuccess } from '#lib/utils/response';
import { ApiError } from '#lib/middleware/errorHandler';
import { ErrorCode, HttpStatus } from '@diran/shared/constants/errors';
import { ActorType, EntityType, RoleType } from '@prisma/client';
import { generateKeyBetween } from 'fractional-indexing';
import { canWrite } from './middlewares';
import { getRoleWithInheritance } from '#lib/services/permission';

// CREATE
// !note: today is 27-Nov-2025, 3:42 AM. i'm keeping these comments for remebering how i thought about the creation process :)
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

/**
 *
 * let's think about permissions:
 * - when creating anything, you can create anything with no parent (basically a root page) and you'll be the owner
 * - when creating anything that has a parent, you need to have at least editor permission on the parent (no permission assignment needed)
 * - when updating or deleting anything, you need to have at least editor permission on it (no permission assignment needed)
 * - when getting anything, you need to have at least viewer permission on it (no permission assignment needed)
 */

// TODO: add a service to manage the permissions stuff....
// our new style create function that let the server handle the order generation
// CREATE - creates a new block, an important and complex function
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

        // only the page with no parent
        if (!parentId) {
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

        return { block };
    });

    const message = !result.block.parentId ? 'Page (very parent block) created successfully' : 'Child block created successfully';

    sendSuccess(reply, { block: result.block }, message, HttpStatus.CREATED); // TODO: should i return the block? i think the id and order or just id maybe enough
};

// ====== Just placeholder(s) for now ======

// READ - gets a single block data by providing its id - not implemented yet
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

// UPDATE - update the block data by providing its id and the new data (needs permission)
const updateBlock = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { id } = req.params as UpdateBlockParamInput;
    const payload = req.body as Partial<UpdateBlockBodyInput>;

    const existing = await db.block.findUnique({ where: { id } });
    if (!existing) {
        throw new ApiError('Block not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Check permission on new parent if parentId is being changed
    if ('parentId' in payload && payload.parentId !== existing.parentId) {
        const newParentId = payload.parentId;

        // If moving to a new parent (not making it a root), check write permission on new parent
        if (newParentId) {
            const role = await getRoleWithInheritance(req.user!.id, newParentId);

            if (!role || role === RoleType.NONE || !canWrite(role)) {
                throw new ApiError(
                    'Access denied: No write permission on new parent block',
                    HttpStatus.FORBIDDEN,
                    ErrorCode.PERMISSION_DENIED
                );
            }
        }
    }

    const result = await db.$transaction(async tx => {
        // Prepare update data
        const dataToUpdate: any = {};

        // Handle basic fields
        if (payload.type !== undefined) dataToUpdate.type = payload.type;
        if (payload.content !== undefined) dataToUpdate.content = payload.content;

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

        return {
            block: {
                ...updated,
                createdAt: updated.createdAt.toISOString(),
                updatedAt: updated.updatedAt.toISOString(),
            },
        };
    });

    sendSuccess(reply, result, 'Block updated successfully');
};

// DELETE - remove a block and all its children recursively (cascade delete)
const deleteBlock = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { id } = req.params as DeleteBlockParamInput;

    const block = await db.block.findUnique({ where: { id } });
    if (!block) {
        throw new ApiError('Block not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await db.$transaction(async tx => {
        // Use recursive CTE to get all descendants in a single query
        // This is WAY more efficient than N+1 queries
        const allBlockIds: string[] = await tx.$queryRaw`
            WITH RECURSIVE descendants AS (
                -- Base case: the block we want to delete
                SELECT id FROM blocks WHERE id = ${id}::uuid
                
                UNION ALL
                
                -- Recursive case: children of blocks we've already found
                SELECT b.id
                FROM blocks b
                INNER JOIN descendants d ON b.parent_id = d.id
            )
            SELECT id FROM descendants
        `;

        const blockIds = allBlockIds.map((row: any) => row.id);

        // Delete in batch - much more efficient
        await Promise.all([
            tx.permission.deleteMany({
                where: {
                    entityId: { in: blockIds },
                    entityType: EntityType.BLOCK,
                },
            }),
            tx.block.deleteMany({
                where: { id: { in: blockIds } },
            }),
        ]);
    });

    sendSuccess(reply, {}, 'Block and all children deleted successfully');
};

// GET DIRECT CHILDREN BLOCKS - gets all direct children blocks of a parent block (needs permission)
const getDirectChildrenBlocks = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { id } = req.params as GetBlockDirectChildrenParamInput;
    const children = await db.block.findMany({
        where: { parentId: id },
        orderBy: { order: 'asc' },
        select: {
            id: true,
            type: true,
            // parentId: true, // no need on the client + wtf bro, it's the same for all
            // order: true, // no need to send the order to the client (it uses indexes)
            content: true,

            // the same with these bad guys
            // createdAt: true,
            // updatedAt: true,
        },
    });

    sendSuccess(reply, { children }, 'Direct children blocks retrieved successfully');
};

// GET CHILDREN TREE - gets all nested children blocks of a parent block (needs permission)
const getChildrenTree = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { id } = req.params as GetBlockChildrenTreeInput;

    // Use recursive CTE to fetch entire tree in a single query
    const allBlocks: Array<{
        id: string;
        type: string;
        parentId: string | null;
        order: string;
        content: any;
    }> = await db.$queryRaw`
        WITH RECURSIVE block_tree AS (
            -- Base case: direct children of the parent block
            SELECT id, type, parent_id, "order", content, 1 as depth
            FROM blocks
            WHERE parent_id = ${id}::uuid
            
            UNION ALL
            
            -- Recursive case: children of blocks we've already found
            SELECT b.id, b.type, b.parent_id, b."order", b.content, bt.depth + 1
            FROM blocks b
            INNER JOIN block_tree bt ON b.parent_id = bt.id
            WHERE bt.depth < 100
        )
        SELECT id, type, parent_id as "parentId", "order", content
        FROM block_tree
        ORDER BY "order" ASC
    `;

    // Create a map for faster lookups
    const blockMap = new Map<string, any>();

    // Initialize all blocks in the map
    allBlocks.forEach(block => {
        blockMap.set(block.id, {
            id: block.id,
            type: block.type,
            content: JSON.parse(JSON.stringify(block.content)), // Ensure content is properly serializable
            children: [] as any[],
        });
    });

    // Build the tree structure
    const rootChildren: any[] = [];
    allBlocks.forEach(block => {
        const node = blockMap.get(block.id)!;

        if (block.parentId === id) {
            // Direct child of the root
            rootChildren.push(node);
        } else if (block.parentId) {
            // Child of another block
            const parent = blockMap.get(block.parentId);
            if (parent) {
                parent.children.push(node);
            }
        }
    });

    // Remove empty children arrays
    const cleanTree = (nodes: any[]): any[] => {
        return nodes.map(node => {
            if (node.children && node.children.length > 0) {
                return {
                    ...node,
                    children: cleanTree(node.children),
                };
            }
            const { children, ...rest } = node;
            return rest;
        });
    };

    const children = cleanTree(rootChildren);

    return sendSuccess(reply, { children }, 'Block tree retrieved successfully');
};

// GET ALL PAGES - returns all top-level pages the user has access to (optimized with single query)
const getAllPages = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user!.id;

    // Single optimized query with JOIN instead of two separate queries
    const pagesWithRoles: Array<{
        id: string;
        type: string;
        content: any;
        order: string;
        createdAt: Date;
        updatedAt: Date;
        role: string;
    }> = await db.$queryRaw`
        SELECT 
            b.id,
            b.type,
            b.content,
            b."order",
            b.created_at as "createdAt",
            b.updated_at as "updatedAt",
            p.role
        FROM blocks b
        INNER JOIN permissions p ON p.entity_id = b.id
        WHERE 
            b.type::text = 'PAGE'
            AND b.parent_id IS NULL
            AND p.actor_id = ${userId}::uuid
            AND p.actor_type::text = 'USER'
            AND p.entity_type::text = 'BLOCK'
            AND p.role::text IN ('OWNER', 'EDITOR', 'VIEWER')
        ORDER BY b."order" ASC
    `;

    if (pagesWithRoles.length === 0) {
        return sendSuccess(reply, { pages: [] }, 'No pages found');
    }

    // Transform the response
    const transformedPages = pagesWithRoles.map(page => ({
        id: page.id,
        type: page.type,
        content: page.content,
        order: page.order,
        role: page.role,
        createdAt: new Date(page.createdAt).toISOString(),
        updatedAt: new Date(page.updatedAt).toISOString(),
    }));

    return sendSuccess(reply, { pages: transformedPages }, 'Pages retrieved successfully');
};

export { createBlock, getBlock, updateBlock, deleteBlock, getDirectChildrenBlocks, getChildrenTree, getAllPages };
