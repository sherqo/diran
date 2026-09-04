import { FastifyInstance } from 'fastify';
import { validateRequest as vr } from '../../lib/middleware/validation.js';
import { authenticate as auth } from '../../lib/middleware/auth.js';
import { requireReadPermission, requireWritePermission, requireParentPermission } from './middlewares.js';
import { createBlock, getBlock, updateBlock, deleteBlock, getDirectChildrenBlocks, getChildrenTree, searchBlocks } from './controller.js';
import { registerPermissionRoutes } from './permission/routes.js';
import {
    createBlockBodySchema,
    getBlockParamSchema,
    updateBlockParamSchema,
    deleteBlockParamSchema,
    updateBlockBodySchema,
    getBlockDirectChildrenParamSchema,
    getBlockChildrenTreeSchema,
} from '@diran/shared/validation/block.js';

/**
 * I won't add rate limiters here for now.
 * Blocks operations happens a lot
 * and the rate limit is kinda costly
 * so, the global rate limiter should be enough
 */

export async function registerBlockRoutes(fastify: FastifyInstance): Promise<void> {
    // All block routes require authentication

    // Search blocks - requires authentication only
    fastify.get('/search', {
        preHandler: [auth],
        handler: searchBlocks,
    });

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

    // Get block children tree (all nested children for a block) - requires read permission
    fastify.get('/:id/tree', {
        preHandler: [vr({ paramsSchema: getBlockChildrenTreeSchema }), auth, requireReadPermission],
        handler: getChildrenTree,
    });

    // Permission routes - /block/:id/permissions
    await fastify.register(registerPermissionRoutes, { prefix: '/:id/permissions' });
}
