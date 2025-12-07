import { z } from 'zod';

// ================ Role Enum ================

/**
 * All role types.
 */
const RoleTypeValues = ['OWNER', 'EDITOR', 'VIEWER', 'NONE'] as const;
const RoleTypeEnumSchema = z.enum(RoleTypeValues);

/**
 * Shareable roles (roles you can assign to others).
 * OWNER can only be the creator, not assignable.
 */
const ShareableRoleValues = ['EDITOR', 'VIEWER'] as const;
const ShareableRoleEnumSchema = z.enum(ShareableRoleValues);

// ================ Param Schemas ================

export const blockIdParamSchema = z.object({
  id: z.uuid(),
});

export const permissionIdParamSchema = z.object({
  id: z.uuid(),
  permissionId: z.uuid(),
});

// ================ Body Schemas ================

export const addPermissionBodySchema = z.object({
  email: z.email(),
  role: ShareableRoleEnumSchema,
});

export const updatePermissionBodySchema = z.object({
  role: ShareableRoleEnumSchema,
});

// ================ Exported Types ================

export type RoleType = z.infer<typeof RoleTypeEnumSchema>;
export type ShareableRole = z.infer<typeof ShareableRoleEnumSchema>;
export type BlockIdParamInput = z.infer<typeof blockIdParamSchema>;
export type PermissionIdParamInput = z.infer<typeof permissionIdParamSchema>;
export type AddPermissionBodyInput = z.infer<typeof addPermissionBodySchema>;
export type UpdatePermissionBodyInput = z.infer<typeof updatePermissionBodySchema>;
