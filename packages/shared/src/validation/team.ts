import { z } from 'zod';

// ================ Team Role Enum ================

/**
 * Team roles (ADMIN, MEMBER).
 * Note: Owner is stored as a relationship, not a role.
 */
const TeamRoleValues = ['ADMIN', 'MEMBER'] as const;
export const TeamRoleEnumSchema = z.enum(TeamRoleValues);

// ================ Param Schemas ================

export const teamIdParamSchema = z.object({
  teamId: z.uuid(),
});

export const teamMemberIdParamSchema = z.object({
  teamId: z.uuid(),
  memberId: z.uuid(),
});

// ================ Body Schemas ================

export const createTeamBodySchema = z.object({
  name: z.string().min(1).max(100).trim(),
});

export const updateTeamBodySchema = z.object({
  name: z.string().min(1).max(100).trim(),
});

export const addMemberBodySchema = z.object({
  email: z.email(),
  role: TeamRoleEnumSchema.default('MEMBER'),
});

export const updateMemberBodySchema = z.object({
  role: TeamRoleEnumSchema,
});

// ================ Exported Types ================

export type TeamRole = z.infer<typeof TeamRoleEnumSchema>;
export type TeamIdParamInput = z.infer<typeof teamIdParamSchema>;
export type TeamMemberIdParamInput = z.infer<typeof teamMemberIdParamSchema>;
export type CreateTeamBodyInput = z.infer<typeof createTeamBodySchema>;
export type UpdateTeamBodyInput = z.infer<typeof updateTeamBodySchema>;
export type AddMemberBodyInput = z.infer<typeof addMemberBodySchema>;
export type UpdateMemberBodyInput = z.infer<typeof updateMemberBodySchema>;
