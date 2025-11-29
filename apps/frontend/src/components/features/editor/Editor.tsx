'use client';

import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import './styles.css';

import { useTheme } from 'next-themes';
import { useEditor } from '@/contexts/EditorContext';
import { useEffect } from 'react';
import { PartialBlock } from '@blocknote/core';

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
}

export default function Editor({ editable = true, className, initialContent }: EditorProps) {
    const { editor, setContent } = useEditor();
    const { resolvedTheme } = useTheme();
    const colorScheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    // Set initial content when provided
    useEffect(() => {
        if (initialContent) {
            setContent(initialContent);
        }
    }, [initialContent, setContent]);

    // Setup onChange listener with detailed logging
    useEffect(() => {
        const removeListener = editor.onChange((editor, { getChanges }) => {
            const changes = getChanges();
            const content = editor.document;

            handleChanges(changes, content);
        });

        // Cleanup listener on unmount
        return removeListener;
    }, [editor]);

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
