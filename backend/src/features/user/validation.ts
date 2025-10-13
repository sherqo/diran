import { z } from 'zod';

// Update profile schema
export const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    photo: z.url().optional(),
});

// Change password schema
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
