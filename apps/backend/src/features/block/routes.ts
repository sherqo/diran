import { FastifyInstance } from 'fastify';
import { validateRequest as vr } from '#lib/middleware/validation.js';
import { authenticate as auth } from '#lib/middleware/auth.js';
import { requireReadPermission, requireWritePermission, requireParentPermission } from './middlewares.js';
import { createBlock, getBlock, updateBlock, deleteBlock, getDirectChildrenBlocks, getAllPages } from './controller.js';
import {
    createBlockBodySchema,
    getBlockParamSchema,
    updateBlockParamSchema,
    deleteBlockParamSchema,
    updateBlockBodySchema,
    getBlockDirectChildrenParamSchema,
} from '@diran/shared/validation/block.js';

/**
 * I won't add rate limiters here for now.
 * Blocks operations happens a lot
 * and the rate limit is kinda costly
 * so, the global rate limiter should be enough
 */

export async function registerBlockRoutes(fastify: FastifyInstance): Promise<void> {
    // All block routes require authentication

    // Create block - requires parent permission if parentId is provided
    fastify.post('/', {
        preHandler: [vr({ bodySchema: createBlockBodySchema }), auth, requireParentPermission],
        handler: createBlock,
    });

    // Get block - requires read permission
    fastify.get('/:id', {
        preHandler: [vr({ paramsSchema: getBlockParamSchema }), auth, requireReadPermission],
        handler: getBlock,
    });

    // Update block - requires write permission
    fastify.put('/:id', {
        preHandler: [vr({ paramsSchema: updateBlockParamSchema, bodySchema: updateBlockBodySchema }), auth, requireWritePermission],
        handler: updateBlock,
    });

    // Delete block - requires write permission
    fastify.delete('/:id', {
        preHandler: [vr({ paramsSchema: deleteBlockParamSchema }), auth, requireWritePermission],
        handler: deleteBlock,
    });

    // Get all direct children blocks of a parent block - requires read permission
    fastify.get('/:id/children', {
        preHandler: [vr({ paramsSchema: getBlockDirectChildrenParamSchema }), auth, requireReadPermission],
        handler: getDirectChildrenBlocks,
    });
}

export async function registerPageRoutes(fastify: FastifyInstance): Promise<void> {
    // creating, updating, deleting pages is ez and can be done via blocks
    // these routes will be for smth like: getting all pages, getting all blocks in a page, etc.

    fastify.get('/', {
        preHandler: [auth],
        handler: getAllPages,
    });
}
