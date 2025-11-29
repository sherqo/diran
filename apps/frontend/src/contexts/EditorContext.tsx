'use client';

import { BlockNoteEditor, createHeadingBlockSpec, PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { createContext, useContext, ReactNode, useCallback } from 'react';

interface EditorContextType {
    editor: BlockNoteEditor;
    setContent: (content: PartialBlock[]) => void;
    getContent: () => PartialBlock[];
    clearContent: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function useEditor() {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
}

interface EditorProviderProps {
    children: ReactNode;
    initialContent?: PartialBlock[];
}

export function EditorProvider({ children, initialContent }: EditorProviderProps) {
    const heading = createHeadingBlockSpec({
        levels: [1, 2, 3],
    });

    const editor = useCreateBlockNote({
        initialContent,
        blockSpecs: { heading },
    });

    const setContent = useCallback(
        (content: PartialBlock[]) => {
            editor.replaceBlocks(editor.document, content);
        },
        [editor]
    );

    const getContent = useCallback(() => {
        return editor.document;
    }, [editor]);

    const clearContent = useCallback(() => {
        editor.replaceBlocks(editor.document, []);
    }, [editor]);

    const value: EditorContextType = {
        editor,
        setContent,
        getContent,
        clearContent,
    };

    return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
