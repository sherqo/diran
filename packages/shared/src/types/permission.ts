// ================ Permission Types ================

import { RoleType } from '../validation/permission.js';
import { User } from './user.js';

/**
 * Permission response for API.
 */
export interface PermissionResponse {
  id: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'photo'>;
  role: RoleType;
  createdAt: string;
}

/**
 * List permissions response.
 */
export interface ListPermissionsResponse {
  permissions: PermissionResponse[];
  blockId: string;
}
