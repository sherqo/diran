import { FastifyReply } from 'fastify';
import { db } from '#lib/database/connection.js';
import { AuthenticatedRequest } from '#lib/middleware/auth.js';
import { sendSuccess } from '#lib/utils/response.js';

/**
 * Get all root pages the user has access to (owned + shared).
 */
export const getAllPages = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user!.id;

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
        INNER JOIN permissions p ON p.block_id = b.id
        WHERE 
            b.type::text = 'page'
            AND b.parent_id IS NULL
            AND p.user_id = ${userId}::uuid
            AND p.role::text IN ('OWNER', 'EDITOR', 'VIEWER')
        ORDER BY b."order" ASC
    `;

    if (pagesWithRoles.length === 0) {
        return sendSuccess(reply, { pages: [] }, 'No pages found');
    }

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
