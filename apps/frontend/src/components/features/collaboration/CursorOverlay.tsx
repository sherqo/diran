'use client';
import { useEffect, useState, useRef } from 'react';
import { useCollaborationContext } from '@/lib/collaboration';
import type { BlockNoteEditor } from '@blocknote/core';

interface CursorOverlayProps {
    editor: BlockNoteEditor | null;
}

interface CursorPosition {
    oderId: string;
    userName: string;
    userColor: string;
    x: number;
    y: number;
}

export function CursorOverlay({ editor }: CursorOverlayProps) {
    const collaboration = useCollaborationContext();
    const [cursors, setCursors] = useState<CursorPosition[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!editor || !collaboration) return;

        const updateCursors = () => {
            const tiptap = editor._tiptapEditor;
            const editorElement = tiptap.view.dom;
            if (!editorElement || !containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const newCursors: CursorPosition[] = [];
            for (const [oderId, collaborator] of collaboration.collaborators) {
                if (!collaborator.cursor) continue;
                try {
                    const { blockId, offset } = collaborator.cursor;
                    const doc = tiptap.state.doc;
                    let blockPos = null;
                    doc.descendants((node, pos) => {
                        if (node.attrs && node.attrs.id === blockId) {
                            blockPos = pos;
                            return false;
                        }
                        return true;
                    });
                    if (blockPos === null) continue;
                    const absPos = blockPos + offset;
                    const coords = tiptap.view.coordsAtPos(absPos);
                    const x = coords.left - containerRect.left;
                    const y = coords.top - containerRect.top;
                    newCursors.push({ oderId, userName: collaborator.userName, userColor: collaborator.userColor, x, y });
                } catch {}
            }
            setCursors(newCursors);
        };
        updateCursors();
        const unsubscribe = editor.onChange(() => {
            requestAnimationFrame(updateCursors);
        });
        const interval = setInterval(updateCursors, 500);
        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, [editor, collaboration]);

    return (
        <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden">
            {cursors.map(cursor => (
                <div
                    key={cursor.oderId}
                    className="group pointer-events-auto absolute transition-all duration-150 ease-out"
                    style={{ left: cursor.x + 5, top: cursor.y }}>
                    {/* Cursor line */}
                    <div className="h-5 w-0.5 animate-pulse rounded-full" style={{ backgroundColor: cursor.userColor }} />
                    {/* Circle at the top of the cursor */}
                    <div
                        className="border-card absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rounded-3xl border-2 shadow"
                        style={{ backgroundColor: cursor.userColor }}
                    />
                    {/* Name label, on hover*/}
                    <div
                        className="absolute -top-8 left-1/2 -translate-x-1/2 rounded border border-gray-200 bg-black px-2 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow transition-opacity group-hover:opacity-100 dark:border-gray-700 dark:bg-white dark:text-black"
                        style={{ zIndex: 100 }}>
                        {cursor.userName}
                    </div>
                </div>
            ))}
        </div>
    );
}
