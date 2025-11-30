import { apiRequest } from './helpers';
import type { CreateBlockResponseData, GetBlockResponseData, UpdateBlockResponseData, DeleteBlockResponseData } from '@/shared/types/block';
import type { CreateBlockBodyInput, UpdateBlockBodyInput } from '@/shared/validation/block';

/**
 * Create a new block
 */
export const createBlockApi = (data: CreateBlockBodyInput) =>
    apiRequest<CreateBlockResponseData>('/block', {
        method: 'POST',
        body: JSON.stringify(data),
    });

/**
 * Get a block by ID
 */
export const getBlockApi = (id: string) => apiRequest<GetBlockResponseData>(`/block/${id}`);

/**
 * Update a block
 */
export const updateBlockApi = (id: string, data: Partial<UpdateBlockBodyInput>) =>
    apiRequest<UpdateBlockResponseData>(`/block/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

/**
 * Delete a block
 */
export const deleteBlockApi = (id: string) =>
    apiRequest<DeleteBlockResponseData>(`/block/${id}`, {
        method: 'DELETE',
    });

/**
 * Get all pages (blocks with type=PAGE)
 */
export const getAllPagesApi = () =>
    apiRequest<{
        pages: Array<{
            id: string;
            type: string;
            content: Record<string, unknown>;
            order: string;
            role: string;
            createdAt: string;
            updatedAt: string;
        }>;
        length: number;
    }>('/page');
