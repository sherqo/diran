// ================ Block Types (matching BlockNote editor & Prisma enum) ================

/**
 * Block types matching BlockNote's built-in blocks and Prisma BlockType enum.
 * @see https://www.blocknotejs.org/docs/features/blocks
 */
export enum BlockTypeEnum {
  PAGE = 'page',
  PARAGRAPH = 'paragraph',
  HEADING = 'heading',
  QUOTE = 'quote',
  BULLET_LIST_ITEM = 'bulletListItem',
  NUMBERED_LIST_ITEM = 'numberedListItem',
  CHECK_LIST_ITEM = 'checkListItem',
  TOGGLE_LIST_ITEM = 'toggleListItem',
  TABLE = 'table',
  CODE_BLOCK = 'codeBlock',
  IMAGE = 'image',
  VIDEO = 'video',
}

// ================ Inline Content (text inside blocks) ================

/**
 * Text styling options.
 */
export interface TextStyles {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  textColor?: string;
  backgroundColor?: string;
}

/**
 * Inline content item (text, link, etc.)
 * This is what goes inside __content array.
 */
export interface InlineContent {
  type: string;
  text?: string;
  styles?: TextStyles;
  content?: InlineContent[]; // for links
  href?: string; // for links
}

// ================ Block Props ================

/**
 * Common props for all blocks.
 */
export interface BlockProps {
  backgroundColor?: string;
  textColor?: string;
  textAlignment?: 'left' | 'center' | 'right' | 'justify';
  // Heading
  level?: 1 | 2 | 3;
  isToggleable?: boolean;
  // Lists
  start?: number;
  checked?: boolean;
  // Code
  language?: string;
  // Embeds
  name?: string;
  url?: string;
  caption?: string;
  previewWidth?: number;
  showPreview?: boolean;
  // Allow any additional props
  [key: string]: unknown;
}

// ================ Table Types ================

export interface TableCell {
  type: 'tableCell';
  props?: BlockProps;
  content: InlineContent[];
}

export interface TableRow {
  cells: (TableCell | InlineContent[])[];
}

export interface TableContent {
  type: 'tableContent';
  columnWidths?: number[];
  headerRows?: number;
  rows: TableRow[];
}

// ================ Content Stored in DB ================

/**
 * Content for PAGE blocks.
 * Stored directly in Block.content for pages.
 */
export interface PageContent {
  title?: string;
  icon?: string;
  cover?: string;
}

/**
 * Content for non-PAGE blocks.
 * Stored in Block.content with __props and __content.
 */
export interface EmbeddedBlockContent {
  __props: BlockProps;
  __content: InlineContent[] | TableContent | undefined;
}

// ================ API Types ================

/**
 * Block as stored in DB and returned from API.
 */
export interface Block {
  id: string;
  type: BlockTypeEnum | string;
  parentId: string | null;
  order: string;
  content: PageContent | EmbeddedBlockContent;
  createdAt: string;
  updatedAt: string;
  children?: Block[];
}

/**
 * Block returned from tree/children endpoints.
 */
export interface ApiBlock {
  id: string;
  type: string;
  content: PageContent | EmbeddedBlockContent;
  children?: ApiBlock[];
}

// ================ API Response Types ================

export interface CreateBlockResponseData {
  block: Block;
}

export interface GetBlockResponseData {
  block: Block & {
    role: string | null;
    isTeamPage: boolean;
  };
}

export interface UpdateBlockResponseData {
  block: Block;
}

export interface DeleteBlockResponseData {}

export interface GetBlockChildrenResponseData {
  children: ApiBlock[];
}

export interface GetBlockTreeResponseData {
  children: ApiBlock[];
  length: number;
}

// ================ Search Types ================

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  icon: string | null;
  slug: string | null;
  snippet: string | null;
  parentId: string | null;
  rootPageId: string;
  updatedAt: string;
}

export interface SearchBlocksResponseData {
  results: SearchResult[];
}

// ================ Content Extraction (for search) ================

/**
 * Flexible type for extracting text from any content format.
 * Used by backend for search indexing.
 */
export interface ExtractableContent {
  // Page fields
  title?: string;
  icon?: string;
  // Embedded block fields
  __props?: BlockProps;
  __content?: InlineContent[];
  // For recursive extraction
  content?: InlineContent[] | ExtractableContent[];
  children?: ExtractableContent[];
  // Table fields
  rows?: { cells: (InlineContent[] | TableCell)[] }[];
  // Direct text
  text?: string;
}

// ================ Legacy Aliases ================

/** @deprecated Use BlockProps */
export type DefaultBlockProps = BlockProps;
/** @deprecated Use BlockProps */
export type DefaultProps = BlockProps;
/** @deprecated Use TextStyles */
export type Styles = TextStyles;
/** @deprecated Use ExtractableContent */
export type ExtractableBlockContent = ExtractableContent;
/** @deprecated Use PageContent | EmbeddedBlockContent */
export type BlockContent = PageContent | EmbeddedBlockContent;
