import type { BlockOperation } from './collaboration';

// AI Request - includes editor context
export interface AiRequest {
  prompt: string;
  selectedText?: string;
  currentBlock?: {
    id: string;
    type: string;
    content: unknown;
  };
  documentContext?: Array<{
    id: string;
    type: string;
    content: unknown;
  }>;
}

// AI Response - uses the same BlockOperation type as collaboration
export interface AiResponseData {
  type: 'edit' | 'message';
  message?: string;
  operations?: BlockOperation[];
}
