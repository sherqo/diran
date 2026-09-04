import { FastifyInstance } from 'fastify';
import { authenticate as auth } from '../../lib/middleware/auth.js';
import { validateRequest as vr } from '../../lib/middleware/validation.js';
import { listTeams, getTeam, createTeam, updateTeam, deleteTeam, getTeamPages, createTeamPage } from './controller.js';
import { registerMemberRoutes } from './member/routes.js';
import { teamIdParamSchema, createTeamBodySchema, updateTeamBodySchema, createTeamPageBodySchema } from '@diran/shared/validation/team.js';

/**
 * Team routes
 *
 * GET    /team                     - List all teams user is part of
 * POST   /team                     - Create a new team
 * GET    /team/:teamId             - Get team details with members
 * PUT    /team/:teamId             - Update team info (owner only)
 * DELETE /team/:teamId             - Delete team (owner only)
 * GET    /team/:teamId/pages       - Get pages owned by team
 * POST   /team/:teamId/pages       - Create a new page owned by team (owner/admin)
 *
 * Member routes (nested under /:teamId):
 * POST   /team/:teamId/member      - Add member (owner/admin)
 * PUT    /team/:teamId/member/:memberId - Update member role (owner/admin)
 * DELETE /team/:teamId/member/:memberId - Remove member (owner/admin)
 * POST   /team/:teamId/leave       - Leave team (any member except owner)
 */
export async function registerTeamRoutes(fastify: FastifyInstance): Promise<void> {
    // Team CRUD
    fastify.get('/', {
        preHandler: [auth],
        handler: listTeams,
    });

    fastify.post('/', {
        preHandler: [vr({ bodySchema: createTeamBodySchema }), auth],
        handler: createTeam,
    });

    fastify.get('/:teamId', {
        preHandler: [vr({ paramsSchema: teamIdParamSchema }), auth],
        handler: getTeam,
    });

    fastify.put('/:teamId', {
        preHandler: [vr({ paramsSchema: teamIdParamSchema, bodySchema: updateTeamBodySchema }), auth],
        handler: updateTeam,
    });

    fastify.delete('/:teamId', {
        preHandler: [vr({ paramsSchema: teamIdParamSchema }), auth],
        handler: deleteTeam,
    });

    // Get pages owned by team
    fastify.get('/:teamId/pages', {
        preHandler: [vr({ paramsSchema: teamIdParamSchema }), auth],
        handler: getTeamPages,
    });

    // Create a new page owned by team
    fastify.post('/:teamId/pages', {
        preHandler: [vr({ paramsSchema: teamIdParamSchema, bodySchema: createTeamPageBodySchema }), auth],
        handler: createTeamPage,
    });

    // Register member routes under /:teamId
    await fastify.register(registerMemberRoutes, { prefix: '/:teamId' });
}
