import { apiRequest } from './helpers';
import type { PublishResponse } from '@/shared/types/publish';
import type { CreatePublishBodyInput, UpdatePublishBodyInput } from '@/shared/validation/publish';

interface GetPublishResponse {
    publish: PublishResponse | null;
    pageId: string;
}

interface PublishActionResponse {
    publish: PublishResponse;
}

/**
 * Get publish status for a page
 */
export const getPublishApi = (pageId: string) => apiRequest<GetPublishResponse>(`/page/${pageId}/publish`);

/**
 * Publish a page
 */
export const createPublishApi = (pageId: string, data: CreatePublishBodyInput) =>
    apiRequest<PublishActionResponse>(`/page/${pageId}/publish`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

/**
 * Update publish settings
 */
export const updatePublishApi = (pageId: string, data: UpdatePublishBodyInput) =>
    apiRequest<PublishActionResponse>(`/page/${pageId}/publish`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

/**
 * Unpublish a page
 */
export const deletePublishApi = (pageId: string) =>
    apiRequest<{ pageId: string }>(`/page/${pageId}/publish`, {
        method: 'DELETE',
    });
