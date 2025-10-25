import { z } from 'zod';
import { BlockTypeEnum } from '../types/blocks.js';

const BlockTypeEnumSchema = z.enum(BlockTypeEnum);

export const createBlockSchema = z.object({
  // i need a full block here but without id, createdAt, updatedAt
  type: BlockTypeEnumSchema,
  parentId: z.string().optional(),
  order: z.number(), // a lot of Qs here...
  content: z.record(z.string(), z.any()),
});
export const getBlockSchema = z.object({
  id: z.string(),
});
export const updateBlockSchema = z.object({
  id: z.string(),

  // same block but optional
  type: BlockTypeEnumSchema.optional(),
  parentId: z.string().nullable().optional(),
  order: z.number().optional(),
  content: z.record(z.string(), z.any()).optional(),
});
export const deleteBlockSchema = z.object({
  id: z.string(),
});

/**
 * at this moment 14:17 25-Oct-2025
 * i have no idea why i'm adding these types
 * but i feel like it's a good practice bc all files did the same
 */
// Types
export type CreateBlockInput = z.infer<typeof createBlockSchema>;
export type GetBlockInput = z.infer<typeof getBlockSchema>;
export type UpdateBlockInput = z.infer<typeof updateBlockSchema>;
export type DeleteBlockInput = z.infer<typeof deleteBlockSchema>;
