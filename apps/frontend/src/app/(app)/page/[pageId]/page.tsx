'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { usePage } from '@/contexts/PageContext';
import { PageHeader } from '@/components/page-header';
import { Loader2 } from 'lucide-react';
import { Editor } from '@/components/features/editor/DynamicEditor';
import type { PartialBlock, BlockNoteEditor } from '@blocknote/core';
import { getBlockTreeApi } from '@/lib/api/block';

export default function PageView() {
    const params = useParams();
    const pageId = params.pageId as string;
    const { currentPage, pageLoading, loadPage } = usePage();
    const editorRef = useRef<BlockNoteEditor | null>(null);
    const isLoadingChildrenRef = useRef(false);

    useEffect(() => {
        loadPage(pageId);
    }, [pageId, loadPage]);

    const [initialContent, setInitialContent] = useState<PartialBlock[] | null>(null);

    // Recursively map API response to PartialBlock format
    const mapTreeToPartialBlocks = useCallback((children: any[]): PartialBlock[] => {
        return children.map(child => {
            const block: PartialBlock = {
                id: child.id,
                type: child.type.toLowerCase(),
                content: child.content,
            };

            // Recursively map nested children
            if (child.children && child.children.length > 0) {
                block.children = mapTreeToPartialBlocks(child.children);
            }

            return block;
        });
    }, []);

    useEffect(() => {
        let mounted = true;
        const fetchChildren = async () => {
            if (!mounted) return;
            setInitialContent(null);
            isLoadingChildrenRef.current = true;

            try {
                const res = await getBlockTreeApi(pageId);
                if (!mounted) return;

                if (res.success && res.data?.children && res.data.children.length > 0) {
                    const mappedContent = mapTreeToPartialBlocks(res.data.children);
                    setInitialContent(mappedContent);
                } else {
                    setInitialContent([{}] as PartialBlock[]);
                }
            } catch (error) {
                console.error('Error fetching children:', error);
                if (!mounted) return;
                setInitialContent([{}] as PartialBlock[]);
            } finally {
                if (!mounted) return;
                isLoadingChildrenRef.current = false;
            }
        };

        void fetchChildren();

        return () => {
            mounted = false;
        };
    }, [pageId, mapTreeToPartialBlocks]);

    const pageTitle =
        currentPage?.content && typeof currentPage.content === 'object' && 'title' in currentPage.content
            ? String(currentPage.content.title)
            : 'Untitled';

    if (pageLoading) {
        return (
            <>
                <PageHeader title="Loading..." />
                <div className="flex flex-1 items-center justify-center overflow-y-auto">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </>
        );
    }

    if (!currentPage) {
        return (
            <>
                <PageHeader title="Error" />
                <div className="flex flex-1 items-center justify-center overflow-y-auto">
                    <div className="text-center">
                        <p className="text-destructive text-lg">Page not found</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <PageHeader title={pageTitle} />
            <div className="container mx-auto max-w-4xl pt-10 pb-40">
                {initialContent === null ? (
                    <div className="flex items-center justify-center p-10">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <Editor
                        key={pageId}
                        pageId={pageId}
                        initialContent={initialContent}
                        editorRef={editorRef}
                        isLoadingChildrenRef={isLoadingChildrenRef}
                    />
                )}
            </div>
        </>
    );
}
