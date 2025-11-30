'use client';

import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import './styles.css';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { BlockNoteEditor, createHeadingBlockSpec, PartialBlock } from '@blocknote/core';

import * as Button from '@/components/ui/button';
import * as DropdownMenu from '@/components/ui/dropdown-menu';
import * as Card from '@/components/ui/card';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Popover from '@/components/ui/popover';
import * as Tooltip from '@/components/ui/tooltip';

import { handleChanges } from './changes-engine';

interface EditorProps {
    editable?: boolean;
    className?: string;
    initialContent?: PartialBlock[];
    pageId: string;
}

export default function Editor({ editable = true, className, initialContent, pageId }: EditorProps) {
    const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
    const { resolvedTheme } = useTheme();
    const colorScheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    // Create new editor for each page
    useEffect(() => {
        const heading = createHeadingBlockSpec({
            levels: [1, 2, 3],
        });

        const editorInstance = BlockNoteEditor.create({
            initialContent: initialContent,
            blockSpecs: { heading },
        });

        setEditor(editorInstance);

        return () => {
            editorInstance._tiptapEditor.destroy();
            setEditor(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Listen to changes
    useEffect(() => {
        if (!editor) return;

        const unsubscribe = editor.onChange((editor, { getChanges }) => {
            const changes = getChanges();
            const content = editor.document;
            handleChanges(changes, content, pageId);
        });

        return unsubscribe;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <BlockNoteView
            editor={editor}
            className={`bn-container bn-shadcn ${className || ''}`}
            data-theming-css-variables-editor
            data-color-scheme={colorScheme}
            shadCNComponents={{
                Button,
                DropdownMenu,
                Card,
                Input,
                Label,
                Popover,
                Tooltip,
            }}
            theme={colorScheme}
            editable={editable}
        />
    );
}
