'use client';

import React, { createContext, useContext, useMemo, useCallback, useRef } from 'react';
import { useCollaboration } from './useCollaboration';
import type { BlockOperation, CursorPosition, CollaboratorInfo, ConnectionState } from '@/shared/types/collaboration';
import type { BlockNoteEditor } from '@blocknote/core';

interface CollaborationContextValue {
    // Connection state
    connectionState: ConnectionState;
    collaborators: Map<string, CollaboratorInfo>;
    version: number;

    // Actions
    sendOperation: (operation: BlockOperation) => void;
    sendCursor: (cursor: CursorPosition | null) => void;

    // Editor binding
    bindEditor: (editor: BlockNoteEditor | null) => void;
}

const CollaborationContext = createContext<CollaborationContextValue | null>(null);

interface CollaborationProviderProps {
    children: React.ReactNode;
    pageId: string;
    userId: string;
    userName: string;
    enabled?: boolean;
}

export function CollaborationProvider({ children, pageId, userId, userName, enabled = true }: CollaborationProviderProps) {
    const editorRef = useRef<BlockNoteEditor | null>(null);
    const isApplyingRemoteRef = useRef(false);

    // Handle incoming operations from other users
    const handleOperation = useCallback((operation: BlockOperation) => {
        const editor = editorRef.current;
        if (!editor) return;

        // Flag that we're applying a remote change (to skip sending it back)
        isApplyingRemoteRef.current = true;

        try {
            switch (operation.op) {
                case 'insert':
                    // Insert a new block after the specified block
                    if (operation.afterBlockId) {
                        editor.insertBlocks(
                            [operation.block as Parameters<typeof editor.insertBlocks>[0][0]],
                            { id: operation.afterBlockId },
                            'after'
                        );
                    } else {
                        // Insert at the beginning
                        const firstBlock = editor.document[0];
                        if (firstBlock) {
                            editor.insertBlocks([operation.block as Parameters<typeof editor.insertBlocks>[0][0]], firstBlock, 'before');
                        }
                    }
                    break;

                case 'update':
                    // Update an existing block
                    editor.updateBlock(operation.blockId, operation.changes as Parameters<typeof editor.updateBlock>[1]);
                    break;

                case 'delete':
                    // Remove a block
                    editor.removeBlocks([{ id: operation.blockId }]);
                    break;

                case 'move':
                    // Move requires delete + insert (BlockNote doesn't have direct move)
                    // This is handled by the bulk-update case or separate delete/insert ops
                    console.log('[Collab] Move operation - handled via delete/insert');
                    break;

                case 'bulk-update':
                    // Replace all blocks (used for initial sync or large changes)
                    editor.replaceBlocks(editor.document, operation.blocks as Parameters<typeof editor.replaceBlocks>[1]);
                    break;
            }
        } catch (error) {
            console.error('[Collab] Failed to apply operation:', error);
        } finally {
            // Reset flag after a tick to ensure onChange doesn't catch this
            setTimeout(() => {
                isApplyingRemoteRef.current = false;
            }, 0);
        }
    }, []);

    // Handle cursor updates from other users
    const handleCursorUpdate = useCallback(
        (senderId: string, cursor: CursorPosition | null, userInfo: { userName: string; userColor: string }) => {
            // TODO: Render cursor indicators in the editor
            // This would require custom BlockNote extensions or overlay elements
            console.log(`[Collab] Cursor update from ${userInfo.userName}:`, cursor);
        },
        []
    );

    const { connectionState, collaborators, version, sendOperation, sendCursor } = useCollaboration({
        pageId,
        userId,
        userName,
        enabled,
        onOperation: handleOperation,
        onCursorUpdate: handleCursorUpdate,
    });

    // Bind an editor instance to this collaboration session
    const bindEditor = useCallback((editor: BlockNoteEditor | null) => {
        editorRef.current = editor;
    }, []);

    // Wrap sendOperation to check if we're applying a remote change
    const wrappedSendOperation = useCallback(
        (operation: BlockOperation) => {
            // Don't send if we're applying a remote operation
            if (isApplyingRemoteRef.current) {
                return;
            }
            sendOperation(operation);
        },
        [sendOperation]
    );

    const value = useMemo<CollaborationContextValue>(
        () => ({
            connectionState,
            collaborators,
            version,
            sendOperation: wrappedSendOperation,
            sendCursor,
            bindEditor,
        }),
        [connectionState, collaborators, version, wrappedSendOperation, sendCursor, bindEditor]
    );

    return <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>;
}

export function useCollaborationContext(): CollaborationContextValue | null {
    return useContext(CollaborationContext);
}

export function useCollaborationRequired(): CollaborationContextValue {
    const context = useContext(CollaborationContext);
    if (!context) {
        throw new Error('useCollaborationRequired must be used within a CollaborationProvider');
    }
    return context;
}
