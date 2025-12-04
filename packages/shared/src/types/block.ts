// ================ Block Types (matching BlockNote editor) ================

/**
 * Block types matching BlockNote's built-in blocks.
 * Using lowercase to match BlockNote's type names exactly.
 * @see https://www.blocknotejs.org/docs/features/blocks
 */
export enum BlockTypeEnum {
  // Special type for pages (not a BlockNote type)
  PAGE = 'page',

  // Typography blocks
  PARAGRAPH = 'paragraph',
  HEADING = 'heading',
  QUOTE = 'quote',

  // TODO: Add more block types as needed
  // List types: bulletListItem, numberedListItem, checkListItem, toggleListItem
  // Embeds: image, video, audio, file
  // Other: table, codeBlock
}

// ================ Text Styles (for inline content) ================

/**
 * Text styles matching BlockNote's default styles.
 * @see https://www.blocknotejs.org/docs/features/blocks/inline-content
 */
export interface Styles {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  textColor?: string;
  backgroundColor?: string;
}

// ================ Inline Content Types ================

/**
 * Styled text inline content.
 */
export interface StyledText {
  type: 'text';
  text: string;
  styles: Styles;
}

/**
 * Link inline content.
 */
export interface Link {
  type: 'link';
  content: StyledText[];
  href: string;
}

/**
 * Union of all inline content types.
 */
export type InlineContent = StyledText | Link;

// ================ Default Block Props ================

/**
 * Default props that apply to all blocks.
 * @see https://www.blocknotejs.org/docs/features/blocks
 */
export interface DefaultProps {
  backgroundColor?: string;
  textColor?: string;
  textAlignment?: 'left' | 'center' | 'right' | 'justify';
}

// ================ Typography Block Props ================

/**
 * Heading block specific props.
 */
export interface HeadingProps extends DefaultProps {
  level: 1 | 2 | 3;
}

// ================ Block Content Types ================

/**
 * Content structure for paragraph blocks.
 */
export interface ParagraphContent {
  props?: DefaultProps;
  content: InlineContent[];
}

/**
 * Content structure for heading blocks.
 */
export interface HeadingContent {
  props: HeadingProps;
  content: InlineContent[];
}

/**
 * Content structure for quote blocks.
 */
export interface QuoteContent {
  props?: DefaultProps;
  content: InlineContent[];
}

/**
 * Union of all block content types.
 */
export type BlockContent = ParagraphContent | HeadingContent | QuoteContent | Record<string, unknown>;

// ================ Embedded Content Format ================

/**
 * When storing blocks to the backend, we embed props inside content.
 * This structure allows the backend to store props without a dedicated field.
 */
export interface EmbeddedBlockContent {
  __props: DefaultProps | HeadingProps | Record<string, unknown>;
  __content: InlineContent[];
}

/**
 * Content can be either the embedded format (for storage) or raw inline content.
 */
export type StorageBlockContent = EmbeddedBlockContent | BlockContent;

// ================ Block Interface ================

/**
 * Block structure matching BlockNote's block format.
 * @see https://www.blocknotejs.org/docs/features/blocks
 */
export interface Block {
  id: string;
  type: BlockTypeEnum;
  parentId: string | null; // null for root blocks like PAGE
  order: number;
  content: BlockContent;
  createdAt: string;
  updatedAt: string;
  children?: Block[];
}

export interface CreateBlockResponseData {
  block: Block; // do i really need to return it????
}

export interface GetBlockResponseData {
  block: Block;
}

export interface UpdateBlockResponseData {
  block: Block; // do i really need to return it????
}

export interface DeleteBlockResponseData {}

export interface GetBlockChildrenResponseData {
  blocks: Block[];
}

/**
 * Block structure as returned from API (with embedded content format).
 */
export interface ApiBlock {
  id: string;
  type: string;
  content: EmbeddedBlockContent | Record<string, unknown>;
  children?: ApiBlock[];
}

export interface GetBlockTreeResponseData {
  children: ApiBlock[];
  length: number;
}
