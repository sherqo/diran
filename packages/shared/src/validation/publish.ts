import { z } from 'zod';

// ================ Param Schemas ================

export const publishBlockIdParamSchema = z.object({
  id: z.uuid(),
});

// ================ Body Schemas ================

export const createPublishBodySchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be at most 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  showInFeed: z.boolean().optional(),
});

export const updatePublishBodySchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be at most 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only')
    .optional(),
  showInFeed: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// ================ Query Schemas ================

export const getPublishedPageParamSchema = z.object({
  slug: z.string().min(1),
});

// ================ Exported Types ================

export type PublishBlockIdParamInput = z.infer<typeof publishBlockIdParamSchema>;
export type CreatePublishBodyInput = z.infer<typeof createPublishBodySchema>;
export type UpdatePublishBodyInput = z.infer<typeof updatePublishBodySchema>;
export type GetPublishedPageParamInput = z.infer<typeof getPublishedPageParamSchema>;
