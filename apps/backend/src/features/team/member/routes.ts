import { FastifyInstance } from 'fastify';
import { authenticate as auth } from '#lib/middleware/auth.js';
import { validateRequest as vr } from '#lib/middleware/validation.js';
import { addMember, updateMember, removeMember, leaveTeam } from './controller.js';
import {
    teamIdParamSchema,
    teamMemberIdParamSchema,
    addMemberBodySchema,
    updateMemberBodySchema,
} from '@diran/shared/validation/team.js';

/**
 * Member routes (nested under /team/:teamId)
 *
 * POST   /member              - Add member (owner/admin)
 * PUT    /member/:memberId    - Update member role (owner/admin)
 * DELETE /member/:memberId    - Remove member (owner/admin)
 * POST   /leave               - Leave team (any member except owner)
 */
export async function registerMemberRoutes(fastify: FastifyInstance): Promise<void> {
    // Add member
    fastify.post('/member', {
        preHandler: [vr({ paramsSchema: teamIdParamSchema, bodySchema: addMemberBodySchema }), auth],
        handler: addMember,
    });

    // Update member role
    fastify.put('/member/:memberId', {
        preHandler: [vr({ paramsSchema: teamMemberIdParamSchema, bodySchema: updateMemberBodySchema }), auth],
        handler: updateMember,
    });

    // Remove member
    fastify.delete('/member/:memberId', {
        preHandler: [vr({ paramsSchema: teamMemberIdParamSchema }), auth],
        handler: removeMember,
    });

    // Leave team
    fastify.post('/leave', {
        preHandler: [vr({ paramsSchema: teamIdParamSchema }), auth],
        handler: leaveTeam,
    });
}
