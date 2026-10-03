import { z } from 'zod';
import { BlockTypeEnum } from '../types/block.js';

// ================ Enum Values for Zod ================

/**
 * Block type enum values as a tuple for Zod validation.
 * Must match BlockTypeEnum exactly.
 */
const BlockTypeValues = [
  BlockTypeEnum.PAGE,
  // Typography
  BlockTypeEnum.PARAGRAPH,
  BlockTypeEnum.HEADING,
  BlockTypeEnum.QUOTE,
  // Lists
  BlockTypeEnum.BULLET_LIST_ITEM,
  BlockTypeEnum.NUMBERED_LIST_ITEM,
  BlockTypeEnum.CHECK_LIST_ITEM,
  BlockTypeEnum.TOGGLE_LIST_ITEM,
  // Table
  BlockTypeEnum.TABLE,
  // Code
  BlockTypeEnum.CODE_BLOCK,
  // Layout
  BlockTypeEnum.DIVIDER,
  // Embeds
  BlockTypeEnum.IMAGE,
  BlockTypeEnum.VIDEO,
] as const;

const BlockTypeEnumSchema = z.enum(BlockTypeValues);

// ================ Inline Content Schemas ================

/**
 * Text styles schema matching BlockNote's default styles.
 */
const StylesSchema = z.object({
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  strike: z.boolean().optional(),
  textColor: z.string().optional(),
  backgroundColor: z.string().optional(),
});

/**
 * Styled text inline content schema.
 */
const StyledTextSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  styles: StylesSchema,
});

/**
 * Link inline content schema.
 */
const LinkSchema = z.object({
  type: z.literal('link'),
  content: z.array(StyledTextSchema),
  href: z.string().url(),
});

/**
 * Union of all inline content types.
 */
const InlineContentSchema = z.union([StyledTextSchema, LinkSchema]);

// ================ Block Props Schemas ================

/**
 * Default block props schema.
 */
const DefaultPropsSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  textAlignment: z.enum(['left', 'center', 'right', 'justify']).optional(),
});

/**
 * Heading props schema with level.
 */
const HeadingPropsSchema = DefaultPropsSchema.extend({
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

// ================ Block Content Schemas ================

/**
 * Paragraph content schema.
 */
const ParagraphContentSchema = z.object({
  props: DefaultPropsSchema.optional(),
  content: z.array(InlineContentSchema),
});

/**
 * Heading content schema.
 */
const HeadingContentSchema = z.object({
  props: HeadingPropsSchema,
  content: z.array(InlineContentSchema),
});

/**
 * Quote content schema.
 */
const QuoteContentSchema = z.object({
  props: DefaultPropsSchema.optional(),
  content: z.array(InlineContentSchema),
});

// ================ Block Validation Schemas ================

const createBlockBaseSchema = z.object({
  id: z.uuid().optional(),
  type: BlockTypeEnumSchema,
  parentId: z.uuid().optional().nullable(),
  prevId: z.uuid().optional().nullable(),
  nextId: z.uuid().optional().nullable(),
  content: z.any(), // Using z.any() for flexibility; content structure varies by block type
});

const checkCreateParentRequirement = (data: { type: string; parentId?: string | null; id?: string }) => {
  const hasParent = typeof data.parentId === 'string' && data.parentId.trim() !== '';
  // no need for the id if it's a parent page
  if (data.type === BlockTypeEnum.PAGE && !hasParent) {
    return !data.id;
  }

  return hasParent || data.type === BlockTypeEnum.PAGE;
};

export const createBlockBodySchema = createBlockBaseSchema.refine(checkCreateParentRequirement, {
  message: "parentId is required unless type='page'",
  path: ['parentId'],
});

export const getBlockParamSchema = z.object({
  id: z.uuid(),
});

export const updateBlockParamSchema = z.object({
  id: z.uuid(),
});

export const updateBlockBodySchema = z.object({
  type: BlockTypeEnumSchema.optional(),
  parentId: z.uuid().nullable().optional(),
  prevId: z.uuid().nullable().optional(),
  nextId: z.uuid().nullable().optional(),
  content: z.any().optional(), // Using z.any() for flexibility; content structure varies by block type
});

export const deleteBlockParamSchema = z.object({
  id: z.uuid(),
});

// ================ Bulk Operations ================
// One HTTP round trip for a whole sync flush (paste = hundreds of creates).
// Each op reuses the single-op field schemas so validation can't drift.

const bulkCreateOpSchema = createBlockBaseSchema
  .extend({ op: z.literal('create') })
  .refine(checkCreateParentRequirement, {
    message: "parentId is required unless type='page'",
    path: ['parentId'],
  });

const bulkUpdateOpSchema = updateBlockBodySchema.extend({
  op: z.literal('update'),
  blockId: z.uuid(),
});

const bulkDeleteOpSchema = z.object({
  op: z.literal('delete'),
  blockId: z.uuid(),
});

export const bulkBlockBodySchema = z.object({
  operations: z
    .array(z.discriminatedUnion('op', [bulkCreateOpSchema, bulkUpdateOpSchema, bulkDeleteOpSchema]))
    .min(1, 'At least one operation is required')
    .max(500, 'At most 500 operations per bulk request'),
});

export const getBlockDirectChildrenParamSchema = z.object({
  id: z.uuid(),
});

export const getBlockChildrenTreeSchema = z.object({
  id: z.uuid(),
});

// ================ Exported Types ================

export type CreateBlockBodyInput = z.infer<typeof createBlockBodySchema>;
export type BulkBlockBodyInput = z.infer<typeof bulkBlockBodySchema>;
export type BulkBlockOpInput = BulkBlockBodyInput['operations'][number];
export type GetBlockParamInput = z.infer<typeof getBlockParamSchema>;
export type UpdateBlockParamInput = z.infer<typeof updateBlockParamSchema>;
export type UpdateBlockBodyInput = z.infer<typeof updateBlockBodySchema>;
export type DeleteBlockParamInput = z.infer<typeof deleteBlockParamSchema>;
export type GetBlockDirectChildrenParamInput = z.infer<typeof getBlockDirectChildrenParamSchema>;
export type GetBlockChildrenTreeInput = z.infer<typeof getBlockChildrenTreeSchema>;

// ================ Content Schema Exports ================
// Export content schemas for use in other validation files if needed

export {
  StylesSchema,
  StyledTextSchema,
  LinkSchema,
  InlineContentSchema,
  DefaultPropsSchema,
  HeadingPropsSchema,
  ParagraphContentSchema,
  HeadingContentSchema,
  QuoteContentSchema,
};
