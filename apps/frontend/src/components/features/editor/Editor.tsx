'use client';

import '@blocknote/core/fonts/inter.css';
// import type { BlockNoteEditor, PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { useEffect } from 'react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';

import './styles.css';
import { useTheme } from 'next-themes';

import * as Button from '@/components/ui/button';
import * as DropdownMenu from '@/components/ui/dropdown-menu';
import * as Card from '@/components/ui/card';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Popover from '@/components/ui/popover';
import * as Tooltip from '@/components/ui/tooltip';
import { BlockNoteEditor, PartialBlock } from '@blocknote/core';

// import { useEffect } from 'react';

interface EditorProps {
    editable?: boolean;
    initialContent?: PartialBlock[];
    onChange?: (editor: BlockNoteEditor, details?: { getChanges?: () => unknown }) => void;
    onEditorReady?: (editor: BlockNoteEditor) => void;
}

export default function Editor({ editable = true, initialContent, onChange, onEditorReady }: EditorProps) {
    const editor = useCreateBlockNote({
        initialContent,
    });

    // Inform consumer when editor instance is ready
    useEffect(() => {
        if (editor && typeof editor !== 'undefined') {
            // call the callback (if provided)
            (onEditorReady as ((editor: BlockNoteEditor) => void) | undefined)?.(editor);
        }
    }, [editor, onEditorReady]);

    const { resolvedTheme } = useTheme();
    const colorScheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    {
        /* This is the options: https://www.blocknotejs.org/docs/reference/editor/overview#options
    another options: https://www.blocknotejs.org/docs/react/overview */
    }
    return (
        // <div>
        <BlockNoteView
            editor={editor}
            className="bn-container bn-shadcn"
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
            onChange={onChange}
        />
        // </div>
    );
}
