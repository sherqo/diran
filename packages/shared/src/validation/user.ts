import { z } from 'zod';
import { basePasswordSchema, strongPasswordSchema } from './auth';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters').optional(),
  photo: z.union([z.url(), z.literal('')]).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: basePasswordSchema,
  newPassword: strongPasswordSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
