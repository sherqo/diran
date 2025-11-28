'use client';

import '@blocknote/core/fonts/inter.css';
// import type { BlockNoteEditor, PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
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

// import { useEffect } from 'react';

// interface EditorProps {
//     editable?: boolean;
//     initialContent?: PartialBlock[];
//     onChange?: (editor: BlockNoteEditor) => void;
//     onEditorReady?: (editor: BlockNoteEditor) => void;
// }

export default function Editor() {
    // { editable = true, initialContent, onChange, onEditorReady }: EditorProps
    const editor = useCreateBlockNote({
        // initialContent,
    });

    const { resolvedTheme } = useTheme();
    const colorScheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    return (
        <div className="bn-container bn-shadcn" data-theming-css-variables-editor data-color-scheme={colorScheme}>
            {/* This is the options: https://www.blocknotejs.org/docs/reference/editor/overview#options
                another options: https://www.blocknotejs.org/docs/react/overview */}
            <BlockNoteView
                editor={editor}
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
            />
        </div>
    );
}
