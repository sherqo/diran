import type { WebSocket } from 'ws';

export type { WebSocket };
// Client connection with metadata
export interface CollaborationClient {
  socket: WebSocket;
  userId: string;
  userName: string;
  userColor: string;
  pageId: string;
  cursor: CursorPosition | null;
}

// Cursor position in the editor
export interface CursorPosition {
  blockId: string;
  offset: number;
}

// Room = a page being edited by multiple users
export interface CollaborationRoom {
  pageId: string;
  clients: Map<string, CollaborationClient>; // keyed by oderId
  version: number; // For conflict detection
}

// Messages from client to server
export type ClientMessage =
  | { type: 'join'; pageId: string; userId: string; userName: string; userColor: string }
  | { type: 'leave' }
  | { type: 'operation'; operation: BlockOperation }
  | { type: 'cursor'; cursor: CursorPosition | null };

// Messages from server to client
export type ServerMessage =
  | { type: 'joined'; pageId: string; clients: ClientInfo[]; version: number }
  | { type: 'user-joined'; user: ClientInfo }
  | { type: 'user-left'; oderId: string }
  | { type: 'operation'; oderId: string; operation: BlockOperation; version: number }
  | { type: 'cursor'; oderId: string; userId: string; userName: string; userColor: string; cursor: CursorPosition | null }
  | { type: 'error'; message: string };

// Simplified client info for broadcasting
export interface ClientInfo {
  oderId: string;
  userId: string;
  userName: string;
  userColor: string;
  cursor: CursorPosition | null;
}

// Block operations - what can happen to blocks
export type BlockOperation =
  | { op: 'insert'; blockId: string; afterBlockId: string | null; block: unknown }
  | { op: 'update'; blockId: string; changes: unknown }
  | { op: 'delete'; blockId: string }
  | { op: 'move'; blockId: string; afterBlockId: string | null }
  | { op: 'bulk-update'; blocks: unknown[] }; // For paste, initial load, etc.

// Simplified client info
export interface CollaboratorInfo {
  oderId: string;
  userId: string;
  userName: string;
  userColor: string;
  cursor: CursorPosition | null;
}

// Connection states
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
