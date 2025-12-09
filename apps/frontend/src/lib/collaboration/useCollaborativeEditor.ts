'use client';

import { useEffect, useRef } from 'react';
import { useCollaborationContext } from '@/lib/collaboration';
import type { BlockNoteEditor, Block } from '@blocknote/core';
import type { BlockOperation } from '@/shared/types/collaboration';

interface UseCollaborativeEditorOptions {
    editor: BlockNoteEditor | null;
    enabled?: boolean;
}

/**
 * Hook to connect a BlockNote editor to the collaboration system.
 *
 * This hook:
 * 1. Binds the editor to the collaboration provider
 * 2. Sends local changes to other collaborators via WebSocket
 * 3. The provider handles applying remote changes
 */
export function useCollaborativeEditor({ editor, enabled = true }: UseCollaborativeEditorOptions) {
    const collaboration = useCollaborationContext();
    const isRemoteChangeRef = useRef(false);
    const lastDocumentRef = useRef<Block[]>([]);

    // Bind editor to collaboration provider
    useEffect(() => {
        if (!collaboration || !enabled) return;
        collaboration.bindEditor(editor);

        return () => {
            collaboration.bindEditor(null);
        };
    }, [editor, collaboration, enabled]);

    // Listen to editor changes and broadcast them
    useEffect(() => {
        if (!editor || !collaboration || !enabled) return;

        // Store initial document state
        lastDocumentRef.current = editor.document;

        const unsubscribe = editor.onChange((editorInstance, { getChanges }) => {
            // Skip if this change is from a remote operation
            if (isRemoteChangeRef.current) {
                return;
            }

            const changes = getChanges();
            if (changes.length === 0) return;

            // Convert BlockNote changes to our operation format and send
            changes.forEach(change => {
                let operation: BlockOperation | null = null;

                switch (change.type) {
                    case 'insert': {
                        // Find the block that comes before this one
                        const currentDoc = editorInstance.document;
                        const blockIndex = currentDoc.findIndex(b => b.id === change.block.id);
                        const afterBlockId = blockIndex > 0 ? currentDoc[blockIndex - 1].id : null;

                        operation = {
                            op: 'insert',
                            blockId: change.block.id,
                            afterBlockId,
                            block: change.block,
                        };
                        break;
                    }

                    case 'update': {
                        // Send the updated block content
                        operation = {
                            op: 'update',
                            blockId: change.block.id,
                            changes: change.block,
                        };
                        break;
                    }

                    case 'delete': {
                        operation = {
                            op: 'delete',
                            blockId: change.block.id,
                        };
                        break;
                    }

                    // Note: BlockNote's 'move' isn't directly exposed,
                    // it comes as delete + insert
                }

                if (operation) {
                    collaboration.sendOperation(operation);
                }
            });

            // Update last known document state
            lastDocumentRef.current = editorInstance.document;
        });

        return unsubscribe;
    }, [editor, collaboration, enabled]);

    // Track cursor position and send updates
    useEffect(() => {
        if (!editor || !collaboration || !enabled) return;

        // BlockNote doesn't have a direct cursor API,
        // but we can track selection changes via the underlying Tiptap editor
        const tiptap = editor._tiptapEditor;

        const handleSelectionUpdate = () => {
            const { selection } = tiptap.state;

            // Try to find which block the cursor is in
            const pos = selection.anchor;
            const resolvedPos = tiptap.state.doc.resolve(pos);

            // Find the block node
            for (let depth = resolvedPos.depth; depth >= 0; depth--) {
                const node = resolvedPos.node(depth);
                if (node.attrs?.id) {
                    collaboration.sendCursor({
                        blockId: node.attrs.id,
                        offset: pos - resolvedPos.start(depth),
                    });
                    return;
                }
            }

            // Couldn't find block, send null
            collaboration.sendCursor(null);
        };

        tiptap.on('selectionUpdate', handleSelectionUpdate);

        return () => {
            tiptap.off('selectionUpdate', handleSelectionUpdate);
        };
    }, [editor, collaboration, enabled]);

    return {
        connectionState: collaboration?.connectionState ?? 'disconnected',
        collaborators: collaboration?.collaborators ?? new Map(),
        isCollaborating: enabled && collaboration?.connectionState === 'connected',
    };
}
