import { apiRequest } from './helpers';
import type { PermissionResponse, ListPermissionsResponse } from '@/shared/types/permission';
import type { AddPermissionBodyInput, UpdatePermissionBodyInput } from '@/shared/validation/permission';

/**
 * List all permissions for a block
 */
export const listPermissionsApi = (blockId: string) => apiRequest<ListPermissionsResponse>(`/block/${blockId}/permissions`);

/**
 * Add a permission (share with user by email)
 */
export const addPermissionApi = (blockId: string, data: AddPermissionBodyInput) =>
    apiRequest<{ permission: PermissionResponse }>(`/block/${blockId}/permissions`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

/**
 * Update a permission (change role)
 */
export const updatePermissionApi = (blockId: string, permissionId: string, data: UpdatePermissionBodyInput) =>
    apiRequest<{ permission: PermissionResponse }>(`/block/${blockId}/permissions/${permissionId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

/**
 * Remove a permission
 */
export const removePermissionApi = (blockId: string, permissionId: string) =>
    apiRequest<null>(`/block/${blockId}/permissions/${permissionId}`, {
        method: 'DELETE',
    });
