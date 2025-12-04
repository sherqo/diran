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

  // List types
  BULLET_LIST_ITEM = 'bulletListItem',
  NUMBERED_LIST_ITEM = 'numberedListItem',
  CHECK_LIST_ITEM = 'checkListItem',
  TOGGLE_LIST_ITEM = 'toggleListItem',

  // Table
  TABLE = 'table',

  // Code
  CODE_BLOCK = 'codeBlock',

  // Embeds (store URLs, no storage API needed)
  FILE = 'file',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
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
  isToggleable?: boolean;
}

// ================ List Block Props ================

/**
 * Numbered list item props.
 */
export interface NumberedListItemProps extends DefaultProps {
  start?: number;
}

/**
 * Check list item props.
 */
export interface CheckListItemProps extends DefaultProps {
  checked: boolean;
}

// ================ Code Block Props ================

/**
 * Code block props.
 */
export interface CodeBlockProps extends DefaultProps {
  language: string;
}

// ================ Embed Block Props ================

/**
 * File block props.
 */
export interface FileProps extends DefaultProps {
  name?: string;
  url?: string;
  caption?: string;
}

/**
 * Image block props.
 */
export interface ImageProps extends DefaultProps {
  name?: string;
  url?: string;
  caption?: string;
  previewWidth?: number;
}

/**
 * Video block props.
 */
export interface VideoProps extends DefaultProps {
  name?: string;
  url?: string;
  caption?: string;
  showPreview?: boolean;
  previewWidth?: number;
}

/**
 * Audio block props.
 */
export interface AudioProps extends DefaultProps {
  name?: string;
  url?: string;
  caption?: string;
  showPreview?: boolean;
}

// ================ Table Content Types ================

/**
 * Table cell props.
 */
export interface TableCellProps extends DefaultProps {
  colspan?: number;
  rowspan?: number;
}

/**
 * Table cell structure.
 */
export interface TableCell {
  type: 'tableCell';
  props?: TableCellProps;
  content: InlineContent[];
}

/**
 * Table row structure.
 */
export interface TableRow {
  cells: (TableCell | string)[];
}

/**
 * Table content structure.
 */
export interface TableContent {
  type: 'tableContent';
  columnWidths?: number[];
  headerRows?: number;
  rows: TableRow[];
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
 * All possible block props types.
 */
export type BlockProps =
  | DefaultProps
  | HeadingProps
  | NumberedListItemProps
  | CheckListItemProps
  | CodeBlockProps
  | FileProps
  | ImageProps
  | VideoProps
  | AudioProps;

/**
 * Union of all block content types.
 */
export type BlockContent =
  | ParagraphContent
  | HeadingContent
  | QuoteContent
  | TableContent
  | InlineContent[]
  | undefined
  | Record<string, unknown>;

// ================ Embedded Content Format ================

/**
 * When storing blocks to the backend, we embed props inside content.
 * This structure allows the backend to store props without a dedicated field.
 */
export interface EmbeddedBlockContent {
  __props: BlockProps | Record<string, unknown>;
  __content: InlineContent[] | TableContent | undefined;
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
