import { FastifyInstance } from 'fastify';
import { authenticate as auth } from '../../lib/middleware/auth.js';
import { validateRequest as vr } from '../../lib/middleware/validation.js';
import { getAllPages } from './controller.js';
import { registerPublishRoutes } from './publish/routes.js';
import { getPublishedPage } from './publish/controller.js';
import { getPublishedPageParamSchema } from '@diran/shared/validation/publish.js';

/**
 * Page routes
 */
export async function registerPageRoutes(fastify: FastifyInstance): Promise<void> {
    // Get all pages user has access to
    fastify.get('/', { preHandler: [auth], handler: getAllPages });

    // Public route for viewing published pages (no auth required)
    // GET /page/s/:slug
    fastify.get('/s/:slug', {
        preHandler: [vr({ paramsSchema: getPublishedPageParamSchema })],
        handler: getPublishedPage,
    });

    // Publish routes - /page/:id/publish (requires owner role)
    await fastify.register(registerPublishRoutes, { prefix: '/:id/publish' });
}
