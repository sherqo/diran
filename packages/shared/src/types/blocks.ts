export enum BlockType {
  PAGE = 'PAGE',

  // Headings
  HEADING_1 = 'HEADING_1',
  HEADING_2 = 'HEADING_2',
  HEADING_3 = 'HEADING_3',

  PARAGRAPH = 'PARAGRAPH',
  CODE = 'CODE',
  TODO = 'TODO',
}

// we can later extend make this `Block<T>` and have `T` be the content type
export interface Block {
  // All of this should be synced with the database model
  id: string;
  type: BlockType;
  parentId: string | null; // null for root blocks like PAGE
  order: number;
  content: Record<string, any>; // JSON content varies by block type
  createdAt: string;
  updatedAt: string;
  children?: Block[]; // Not all blocks will have children
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
