'use client';

import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import './styles.css';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { BlockNoteEditor, PartialBlock } from '@blocknote/core';
import { SuggestionMenuController, FormattingToolbarController, SideMenuController } from '@blocknote/react';

import * as Button from '@/components/ui/button';
import * as DropdownMenu from '@/components/ui/dropdown-menu';
import * as Card from '@/components/ui/card';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Popover from '@/components/ui/popover';
import * as Tooltip from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

import { handleChanges } from './changes-engine';
import { SlashMenu, getSlashMenuItems, filterSlashMenuItems, CustomFormattingToolbar, CustomSideMenu } from './menus';
import { useCollaborativeEditor } from '@/lib/collaboration';

interface EditorProps {
    editable?: boolean;
    className?: string;
    initialContent?: PartialBlock[];
    pageId: string;
    editorRef?: React.MutableRefObject<BlockNoteEditor | null>;
    onEditorReady?: () => void;
    isLoadingChildrenRef?: React.MutableRefObject<boolean>;
}

export default function Editor({
    editable = true,
    className,
    initialContent,
    pageId,
    editorRef,
    onEditorReady,
    isLoadingChildrenRef,
}: EditorProps) {
    const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
    const { resolvedTheme } = useTheme();
    const colorScheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    // Enable real-time collaboration
    useCollaborativeEditor({ editor });

    // Create new editor for each page
    useEffect(() => {
        const editorInstance = BlockNoteEditor.create({
            initialContent: initialContent,
        });

        setEditor(editorInstance);

        // Set the ref if provided
        if (editorRef) {
            editorRef.current = editorInstance;
        }

        // Call onEditorReady callback after editor is set
        if (onEditorReady) {
            // Use setTimeout to ensure the editor is fully ready
            setTimeout(() => {
                onEditorReady();
            }, 0);
        }

        return () => {
            editorInstance._tiptapEditor.destroy();
            setEditor(null);
            if (editorRef) {
                editorRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Listen to changes (only when editable)
    useEffect(() => {
        if (!editor || !editable) return;

        const unsubscribe = editor.onChange((editor, { getChanges }) => {
            // Skip change handling if we're loading children
            if (isLoadingChildrenRef?.current) {
                return;
            }
            handleChanges(getChanges(), editor.document, pageId);
        });

        return unsubscribe;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, editable]);

    if (!editor) {
        return (
            <div className="space-y-4 pt-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-3/4" />
                <div className="py-2" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
            </div>
        );
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
            // Disable default menus to use custom ones (or hide when read-only)
            slashMenu={false}
            formattingToolbar={false}
            sideMenu={false}>
            {/* Only show editing menus when editable */}
            {editable && (
                <>
                    {/* Slash Menu */}
                    <SuggestionMenuController
                        triggerCharacter="/"
                        getItems={async query => filterSlashMenuItems(getSlashMenuItems(editor), query)}
                        suggestionMenuComponent={SlashMenu}
                    />

                    {/* Formatting Toolbar */}
                    <FormattingToolbarController formattingToolbar={CustomFormattingToolbar} />

                    {/* Side Menu - via drag button*/}
                    <SideMenuController sideMenu={CustomSideMenu} />
                </>
            )}
        </BlockNoteView>
    );
}
