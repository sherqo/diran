import { FastifyInstance } from 'fastify';
import { validateRequest as vr } from '#lib/middleware/validation.js';
import { authenticate as auth } from '#lib/middleware/auth.js';
import { validatePermission as perm } from './middlewares.js';
import { createBlock, getBlock, updateBlock, deleteBlock } from './controller.js';
import {
    createBlockBodySchema,
    getBlockParamSchema,
    updateBlockParamSchema,
    deleteBlockParamSchema,
} from '@diran/shared/validation/block.js';

/**
 * I won't add rate limiters here for now.
 * Blocks operations happens a lot
 * and the rate limit is kinda costly
 * so, the global rate limiter should be enough
 */

export async function registerBlockRoutes(fastify: FastifyInstance): Promise<void> {
    // All block routes require authentication

    // Create block
    fastify.post('/', {
        preHandler: [vr({ bodySchema: createBlockBodySchema }), auth],
        handler: createBlock,
    });

    // Get block (requires permission)
    fastify.get('/:id', {
        preHandler: [vr({ paramsSchema: getBlockParamSchema }), auth, perm],
        handler: getBlock,
    });

    // Update block (requires permission)
    fastify.put('/:id', {
        preHandler: [vr({ paramsSchema: updateBlockParamSchema }), auth, perm],
        handler: updateBlock,
    });

    // Delete block (requires permission)
    fastify.delete('/:id', {
        preHandler: [vr({ paramsSchema: deleteBlockParamSchema }), auth, perm],
        handler: deleteBlock,
    });
}
