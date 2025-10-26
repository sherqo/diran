import { z } from 'zod';
import { BlockTypeEnum } from '../types/blocks.js';

const BlockTypeEnumSchema = z.enum(BlockTypeEnum);

export const createBlockBodySchema = z
  .object({
    // i need a full block here but without id, createdAt, updatedAt
    type: BlockTypeEnumSchema,
    parentId: z.uuid().optional().nullable(),
    order: z.number(), // a lot of Qs here...
    content: z.record(z.string(), z.any()),
  })
  .refine(
    data => {
      // If type is "PAGE", parentId must be undefined.
      // If not "PAGE", parentId must exist.
      if (data.type === BlockTypeEnum.PAGE) return data.parentId === undefined;
      return typeof data.parentId === 'string' && data.parentId.trim() !== '';
    },
    {
      message: "parentId is required unless type='PAGE'",
      path: ['parentId'],
    }
  );

export const getBlockParamSchema = z.object({
  id: z.uuid(),
});

export const updateBlockParamSchema = z.object({
  id: z.uuid(),

  // same block but optional
  type: BlockTypeEnumSchema.optional(),
  parentId: z.uuid().nullable().optional(),
  order: z.number().optional(),
  content: z.record(z.string(), z.any()).optional(),
});

export const deleteBlockParamSchema = z.object({
  id: z.uuid(),
});

/**
 * at this moment 14:17 25-Oct-2025
 * i have no idea why i'm adding these types
 * but i feel like it's a good practice bc all files did the same
 */
// Types
export type CreateBlockBodyInput = z.infer<typeof createBlockBodySchema>;
export type GetBlockParamInput = z.infer<typeof getBlockParamSchema>;
export type UpdateBlockParamInput = z.infer<typeof updateBlockParamSchema>;
export type DeleteBlockParamInput = z.infer<typeof deleteBlockParamSchema>;
