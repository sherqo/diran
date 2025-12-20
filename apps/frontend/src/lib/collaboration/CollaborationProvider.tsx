'use client';

import React, { createContext, useContext, useMemo, useCallback, useRef } from 'react';
import { useCollaboration, type TypingInfo } from './useCollaboration';
import type { BlockOperation, CursorPosition, CollaboratorInfo, ConnectionState } from '@/shared/types/collaboration';
import type { BlockNoteEditor } from '@blocknote/core';
import { applyBlockOperations } from '@/lib/editor/applyOperations';

interface CollaborationContextValue {
    // Connection state
    connectionState: ConnectionState;
    collaborators: Map<string, CollaboratorInfo>;
    typingUsers: Map<string, TypingInfo>;
    version: number;

    // Actions
    sendOperation: (operation: BlockOperation) => void;
    sendCursor: (cursor: CursorPosition | null) => void;
    sendTyping: (blockId: string | null) => void;

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
            applyBlockOperations(editor, [operation], '[Collab]');
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
        (_senderId: string, cursor: CursorPosition | null, userInfo: { userName: string; userColor: string }) => {
            // TODO: Render cursor indicators in the editor
            // This would require custom BlockNote extensions or overlay elements
            console.log(`[Collab] Cursor update from ${userInfo.userName}:`, cursor);
        },
        []
    );

    const { connectionState, collaborators, typingUsers, version, sendOperation, sendCursor, sendTyping } = useCollaboration({
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
            typingUsers,
            version,
            sendOperation: wrappedSendOperation,
            sendCursor,
            sendTyping,
            bindEditor,
        }),
        [connectionState, collaborators, typingUsers, version, wrappedSendOperation, sendCursor, sendTyping, bindEditor]
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
