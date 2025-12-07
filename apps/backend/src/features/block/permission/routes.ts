import { FastifyInstance } from 'fastify';
import { validateRequest as vr } from '#lib/middleware/validation.js';
import { authenticate as auth } from '#lib/middleware/auth.js';
import { requireOwnerRole } from './middleware.js';
import { listPermissions, addPermission, updatePermission, removePermission } from './controller.js';
import {
    blockIdParamSchema,
    permissionIdParamSchema,
    addPermissionBodySchema,
    updatePermissionBodySchema,
} from '@diran/shared/validation/permission.js';

/**
 * Permission routes for a block.
 * All routes require authentication and OWNER role.
 * Mounted at /blocks/:id/permissions
 */
export async function registerPermissionRoutes(fastify: FastifyInstance): Promise<void> {
    // All permission routes require auth + owner role
    fastify.addHook('preHandler', auth);
    fastify.addHook('preHandler', requireOwnerRole);

    // List all permissions for a block
    fastify.get('/', {
        preHandler: [vr({ paramsSchema: blockIdParamSchema })],
        handler: listPermissions,
    });

    // Add a permission (share with user by email)
    fastify.post('/', {
        preHandler: [vr({ paramsSchema: blockIdParamSchema, bodySchema: addPermissionBodySchema })],
        handler: addPermission,
    });

    // Update a permission (change role)
    fastify.put('/:permissionId', {
        preHandler: [vr({ paramsSchema: permissionIdParamSchema, bodySchema: updatePermissionBodySchema })],
        handler: updatePermission,
    });

    // Remove a permission
    fastify.delete('/:permissionId', {
        preHandler: [vr({ paramsSchema: permissionIdParamSchema })],
        handler: removePermission,
    });
}
