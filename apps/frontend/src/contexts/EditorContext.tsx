'use client';

import { BlockNoteEditor } from '@blocknote/core';
import { createContext, useContext, ReactNode, useState } from 'react';

interface EditorContextType {
    editor: BlockNoteEditor | null;
    isLoading: boolean;
    setEditor: (editor: BlockNoteEditor) => void;
    setIsLoading: (loading: boolean) => void;
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
}

export function EditorProvider({ children }: EditorProviderProps) {
    const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    return <EditorContext.Provider value={{ editor, isLoading, setEditor, setIsLoading }}>{children}</EditorContext.Provider>;
}
