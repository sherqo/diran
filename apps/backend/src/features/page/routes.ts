import { FastifyInstance } from 'fastify';
import { authenticate as auth } from '#lib/middleware/auth.js';
import { getAllPages } from './controller.js';

/**
 * Page routes
 */
export async function registerPageRoutes(fastify: FastifyInstance): Promise<void> {
    // Get all pages user has access to
    fastify.get('/', { preHandler: [auth], handler: getAllPages });
}
