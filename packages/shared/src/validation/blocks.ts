import { z } from 'zod';
import { BlockTypeEnum } from '../types/blocks.js';

const BlockTypeEnumSchema = z.enum(BlockTypeEnum);

export const createBlockSchema = z.object({
  // i need a full block here but without id, createdAt, updatedAt
  type: BlockTypeEnumSchema,
  parentId: z.string().optional(),
  order: z.number(),
  content: z.record(z.string(), z.any()),
});
export const getBlockSchema = z.object({});
export const updateBlockSchema = z.object({});
export const deleteBlockSchema = z.object({});
