import { z } from 'zod';
import { BlockTypeEnum } from '../types/block.js';

const BlockTypeEnumSchema = z.enum(BlockTypeEnum);

export const createBlockBodySchema = z
  .object({
    // i need a full block here but without createdAt, updatedAt
    id: z.uuid().optional(),
    type: BlockTypeEnumSchema,
    parentId: z.uuid().optional().nullable(),
    prevId: z.uuid().optional().nullable(),
    nextId: z.uuid().optional().nullable(),
    // order: z.string().min(1).max(100), // a lot of Qs here... ! NO LONGER REQUIRED (i think ^_^)
    content: z.record(z.string(), z.any()),
  })
  .refine(
    data => {
      const hasParent = typeof data.parentId === 'string' && data.parentId.trim() !== '';
      // no need for the id if it's a parent page
      if (data.type === BlockTypeEnum.PAGE && !hasParent) {
        return !data.id;
      }

      // If type is "PAGE", parentId must be undefined. -> this is wrong! (i keep the wrong for reference and not to make the same mistake again)
      // If not "PAGE", parentId must exist.
      // if (data.type === BlockTypeEnum.PAGE) return data.parentId === undefined;
      return hasParent || data.type === BlockTypeEnum.PAGE; //? where do u check for PAGE then?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
  prevId: z.string().optional().nullable(),
  nextId: z.string().optional().nullable(),
  // order: z.string().min(1).max(100), // a lot of Qs here...
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
