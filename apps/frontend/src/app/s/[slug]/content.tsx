'use client';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/shadcn/style.css';
import '@/components/features/editor/styles.css';

import { BlockNoteView } from '@blocknote/shadcn';
import { BlockNoteEditor } from '@blocknote/core';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import type { PartialBlock } from '@blocknote/core';

import * as Button from '@/components/ui/button';
import * as DropdownMenu from '@/components/ui/dropdown-menu';
import * as Card from '@/components/ui/card';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Popover from '@/components/ui/popover';
import * as Tooltip from '@/components/ui/tooltip';
import { LogoButton } from '@/components/ui/logo-button';
import Link from 'next/link';

interface ApiBlock {
    id: string;
    type: string;
    content: unknown;
    children?: ApiBlock[];
}

interface PublishedPage {
    id: string;
    slug: string;
    title: string;
    icon?: string;
    content: ApiBlock[];
    publishedAt: string;
}

interface PublishedPageContentProps {
    page: PublishedPage;
}

// Convert API blocks to BlockNote format
function mapToPartialBlocks(blocks: ApiBlock[]): PartialBlock[] {
    return blocks.map(block => {
        let content: unknown = block.content;
        let props: Record<string, unknown> | undefined = undefined;

        // Check if content uses embedded format
        if (content && typeof content === 'object' && '__props' in content) {
            const embedded = content as { __props?: Record<string, unknown>; __content?: unknown };
            props = embedded.__props;
            content = embedded.__content;
        }

        const partialBlock = {
            id: block.id,
            type: block.type,
            ...(content !== undefined && content !== null && { content }),
            ...(props && { props }),
        } as PartialBlock;

        if (block.children && block.children.length > 0) {
            partialBlock.children = mapToPartialBlocks(block.children);
        }

        return partialBlock;
    });
}

export function PublishedPageContent({ page }: PublishedPageContentProps) {
    const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
    const { resolvedTheme } = useTheme();
    const colorScheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    const initialContent = mapToPartialBlocks(page.content);

    // Create editor on client-side only to avoid "window is not defined" error
    useEffect(() => {
        const editorInstance = BlockNoteEditor.create({
            initialContent: initialContent.length > 0 ? initialContent : undefined,
        });
        setEditor(editorInstance);

        return () => {
            editorInstance._tiptapEditor.destroy();
            setEditor(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!editor) {
        return (
            <div className="bg-background flex min-h-screen items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="bg-background flex min-h-screen flex-col">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto flex h-14 max-w-4xl items-center px-4">
                    <LogoButton className="-ml-4" />
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto max-w-4xl flex-1 px-4 py-8">
                {/* Page Title */}
                <div className="mb-4">
                    {page.icon && <span className="mb-2 block text-5xl">{page.icon}</span>}
                    <h1 className="text-4xl font-bold">{page.title}</h1>
                </div>

                {/* Editor Content */}
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
                    editable={false}
                    sideMenu={false}
                    slashMenu={false}
                    formattingToolbar={false}
                />
            </main>

            {/* Footer */}
            <footer className="border-t">
                <div className="container mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
                    <p className="text-muted-foreground text-sm">
                        © 2025 <span className="font-clash">Diran</span>
                    </p>
                    <div className="flex items-center gap-4">
                        <a
                            href="mailto:sharqawy@diran.app"
                            className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                            Contact
                        </a>
                        <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                            Privacy
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
