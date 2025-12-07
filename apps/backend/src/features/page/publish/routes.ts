import { FastifyInstance } from 'fastify';
import { validateRequest as vr } from '#lib/middleware/validation.js';
import { authenticate as auth } from '#lib/middleware/auth.js';
import { requireOwnerRole } from '#features/block/permission/middleware.js';
import { getPublish, createPublish, updatePublish, deletePublish } from './controller.js';
import { publishBlockIdParamSchema, createPublishBodySchema, updatePublishBodySchema } from '@diran/shared/validation/publish.js';

/**
 * Register publish routes under /page/:id/publish
 * All routes require OWNER role.
 */
export async function registerPublishRoutes(fastify: FastifyInstance): Promise<void> {
    // Get publish status
    fastify.get('/', {
        preHandler: [vr({ paramsSchema: publishBlockIdParamSchema }), auth, requireOwnerRole],
        handler: getPublish,
    });

    // Create publish (publish the page)
    fastify.post('/', {
        preHandler: [vr({ paramsSchema: publishBlockIdParamSchema, bodySchema: createPublishBodySchema }), auth, requireOwnerRole],
        handler: createPublish,
    });

    // Update publish settings
    fastify.put('/', {
        preHandler: [vr({ paramsSchema: publishBlockIdParamSchema, bodySchema: updatePublishBodySchema }), auth, requireOwnerRole],
        handler: updatePublish,
    });

    // Delete publish (unpublish)
    fastify.delete('/', {
        preHandler: [vr({ paramsSchema: publishBlockIdParamSchema }), auth, requireOwnerRole],
        handler: deletePublish,
    });
}
