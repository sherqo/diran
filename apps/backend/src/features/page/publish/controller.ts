import { FastifyReply, FastifyRequest } from 'fastify';
import { db } from '../../../lib/database/connection.js';
import { AuthenticatedRequest } from '../../../lib/middleware/auth.js';
import { sendSuccess } from '../../../lib/utils/response.js';
import { ApiError } from '../../../lib/middleware/errorHandler.js';
import { HttpStatus, ErrorCode } from '@diran/shared/constants/errors.js';
import type { PublishBlockIdParamInput, CreatePublishBodyInput, UpdatePublishBodyInput, GetPublishedPageParamInput } from '@diran/shared';

/**
 * Get publish status for a page.
 * Requires OWNER role.
 */
export const getPublish = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { id: pageId } = req.params as PublishBlockIdParamInput;

    const publish = await db.publish.findUnique({
        where: { blockId: pageId },
    });

    if (!publish) {
        return sendSuccess(reply, { publish: null, pageId }, 'Page is not published');
    }

    return sendSuccess(
        reply,
        {
            publish: {
                id: publish.id,
                pageId: publish.blockId,
                slug: publish.slug,
                showInFeed: publish.showInFeed,
                isActive: publish.isActive,
                createdAt: publish.createdAt.toISOString(),
                updatedAt: publish.updatedAt.toISOString(),
            },
            pageId,
        },
        'Publish status retrieved successfully'
    );
};

/**
 * Publish a page (create publish record).
 * Requires OWNER role.
 */
export const createPublish = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { id: pageId } = req.params as PublishBlockIdParamInput;
    const { slug, showInFeed } = req.body as CreatePublishBodyInput;

    // Check if the block is actually a page
    const block = await db.block.findUnique({
        where: { id: pageId },
        select: { type: true },
    });

    if (!block) {
        throw new ApiError('Page not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (block.type !== 'page') {
        throw new ApiError('Only pages can be published', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Check if page is already published
    const existing = await db.publish.findUnique({
        where: { blockId: pageId },
    });

    if (existing) {
        throw new ApiError('Page is already published', HttpStatus.CONFLICT, ErrorCode.ALREADY_EXISTS);
    }

    // Check if slug is already taken
    const slugExists = await db.publish.findUnique({
        where: { slug },
    });

    if (slugExists) {
        throw new ApiError('Slug is already taken', HttpStatus.CONFLICT, ErrorCode.ALREADY_EXISTS);
    }

    const publish = await db.publish.create({
        data: {
            blockId: pageId,
            slug,
            showInFeed: showInFeed ?? false,
        },
    });

    return sendSuccess(
        reply,
        {
            publish: {
                id: publish.id,
                pageId: publish.blockId,
                slug: publish.slug,
                showInFeed: publish.showInFeed,
                isActive: publish.isActive,
                createdAt: publish.createdAt.toISOString(),
                updatedAt: publish.updatedAt.toISOString(),
            },
        },
        'Page published successfully',
        HttpStatus.CREATED
    );
};

/**
 * Update publish settings for a page.
 * Requires OWNER role.
 */
export const updatePublish = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { id: pageId } = req.params as PublishBlockIdParamInput;
    const body = req.body as UpdatePublishBodyInput;

    // Check if page is published
    const existing = await db.publish.findUnique({
        where: { blockId: pageId },
    });

    if (!existing) {
        throw new ApiError('Page is not published', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // If updating slug, check if it's taken
    if (body.slug && body.slug !== existing.slug) {
        const slugExists = await db.publish.findUnique({
            where: { slug: body.slug },
        });

        if (slugExists) {
            throw new ApiError('Slug is already taken', HttpStatus.CONFLICT, ErrorCode.ALREADY_EXISTS);
        }
    }

    const publish = await db.publish.update({
        where: { blockId: pageId },
        data: {
            ...(body.slug !== undefined && { slug: body.slug }),
            ...(body.showInFeed !== undefined && { showInFeed: body.showInFeed }),
            ...(body.isActive !== undefined && { isActive: body.isActive }),
        },
    });

    return sendSuccess(
        reply,
        {
            publish: {
                id: publish.id,
                pageId: publish.blockId,
                slug: publish.slug,
                showInFeed: publish.showInFeed,
                isActive: publish.isActive,
                createdAt: publish.createdAt.toISOString(),
                updatedAt: publish.updatedAt.toISOString(),
            },
        },
        'Publish settings updated successfully'
    );
};

/**
 * Unpublish a page (delete publish record).
 * Requires OWNER role.
 */
export const deletePublish = async (req: AuthenticatedRequest, reply: FastifyReply): Promise<void> => {
    const { id: pageId } = req.params as PublishBlockIdParamInput;

    // Check if page is published
    const existing = await db.publish.findUnique({
        where: { blockId: pageId },
    });

    if (!existing) {
        throw new ApiError('Page is not published', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await db.publish.delete({
        where: { blockId: pageId },
    });

    return sendSuccess(reply, { pageId }, 'Page unpublished successfully');
};

/**
 * Get published page by slug (public endpoint - no auth required).
 * Returns the page content for rendering.
 */
export const getPublishedPage = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { slug } = req.params as GetPublishedPageParamInput;

    const publish = await db.publish.findUnique({
        where: { slug },
        include: {
            block: true,
        },
    });

    if (!publish || !publish.isActive) {
        throw new ApiError('Published page not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // Get the block tree (all children recursively)
    const getBlockTree = async (parentId: string): Promise<unknown[]> => {
        const children = await db.block.findMany({
            where: { parentId },
            orderBy: { order: 'asc' },
        });

        const result = [];
        for (const child of children) {
            const grandChildren = await getBlockTree(child.id);
            result.push({
                id: child.id,
                type: child.type,
                content: child.content,
                children: grandChildren,
            });
        }
        return result;
    };

    const content = await getBlockTree(publish.blockId);
    const blockContent = publish.block.content as { title?: string; icon?: string };

    return sendSuccess(
        reply,
        {
            page: {
                id: publish.block.id,
                slug: publish.slug,
                title: blockContent.title || 'Untitled',
                icon: blockContent.icon,
                content,
                publishedAt: publish.createdAt.toISOString(),
            },
        },
        'Published page retrieved successfully'
    );
};
