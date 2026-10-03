import { apiRequest } from './helpers';
import type {
    BulkBlockResponseData,
    CreateBlockResponseData,
    GetBlockResponseData,
    UpdateBlockResponseData,
    DeleteBlockResponseData,
    GetBlockTreeResponseData,
    SearchBlocksResponseData,
    ApiBlock,
} from '@/shared/types/block';
import type { BulkBlockBodyInput, CreateBlockBodyInput, UpdateBlockBodyInput } from '@/shared/validation/block';

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
 * Apply many creates/updates/deletes in request order in a single HTTP call.
 * Returns per-operation results — partial success is normal, retry failures.
 */
export const bulkBlockApi = (data: BulkBlockBodyInput) =>
    apiRequest<BulkBlockResponseData>('/block/bulk', {
        method: 'POST',
        body: JSON.stringify(data),
    });

/**
 * Get all direct child blocks of a given parent block
 */
export const getChildBlocksApi = (parentId: string) =>
    apiRequest<{
        children: ApiBlock[];
        length: number;
    }>(`/block/${parentId}/children`);

/**
 * Get entire nested tree of children for a given parent block (recursive)
 */
export const getBlockTreeApi = (parentId: string) => apiRequest<GetBlockTreeResponseData>(`/block/${parentId}/tree`);

/**
 * Get all pages (blocks with type=PAGE) - TODO: bad types
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

/**
 * Search blocks by content text
 */
export const searchBlocksApi = (query: string, limit = 20) =>
    apiRequest<SearchBlocksResponseData>(`/block/search?q=${encodeURIComponent(query)}&limit=${limit}`);
