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

            if (changes.length === 0) return;

            console.log('📝 Document changed! Total changes:', changes.length);

            changes.forEach((change, index) => {
                console.log(`\n🔸 Change ${index + 1}:`);
                console.log('  Type:', change.type);
                console.log('  Source:', change.source.type);
                console.log('  Block ID:', change.block.id);
                console.log('  Block Type:', change.block.type);

                if (change.type === 'insert') {
                    console.log('  ✅ Inserted new block');
                    console.log('  Content:', change.block.content);
                } else if (change.type === 'delete') {
                    console.log('  ❌ Deleted block');
                    console.log('  Was:', change.block.content);
                } else if (change.type === 'update') {
                    console.log('  ✏️  Updated block');
                    console.log('  Previous content:', change.prevBlock.content);
                    console.log('  New content:', change.block.content);
                } else if (change.type === 'move') {
                    console.log('  🔄 Moved block');
                    console.log('  Previous parent:', change.prevParent?.id || 'root');
                    console.log('  Current parent:', change.currentParent?.id || 'root');
                }
            });

            console.log('\n📄 Full document:', editor.document);
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
