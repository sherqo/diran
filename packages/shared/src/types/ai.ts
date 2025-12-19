// AI Request - includes editor context
export interface AiRequest {
  prompt: string;
  selectedText?: string;
  currentBlock?: {
    id: string;
    type: string;
    content: any;
  };
  documentContext?: Array<{
    id: string;
    type: string;
    content: any;
  }>;
}

// Block operation types for AI edits
export type AiBlockOperation =
  | { op: 'update'; blockId: string; content: any[] }
  | { op: 'insert'; afterBlockId: string | null; blocks: Array<{ type: string; content: any[]; props?: any }> }
  | { op: 'delete'; blockId: string }
  | { op: 'replace'; blockId: string; content: any[] };

// AI Response
export interface AiResponseData {
  type: 'edit' | 'message';
  message?: string;
  operations?: AiBlockOperation[];
}
