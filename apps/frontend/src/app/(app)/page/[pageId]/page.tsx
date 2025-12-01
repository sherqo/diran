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

    const [initialContent, setInitialContent] = useState<PartialBlock[] | null>(null);

    useEffect(() => {
        loadPage(pageId);
    }, [pageId, loadPage]);

    // Recursively map API response to PartialBlock format
    const mapToPartialBlocks = useCallback((blocks: any[]): PartialBlock[] => {
        return blocks.map(block => {
            const partialBlock: PartialBlock = {
                id: block.id,
                type: block.type.toLowerCase(),
                content: block.content,
            };

            if (block.children?.length > 0) {
                partialBlock.children = mapToPartialBlocks(block.children);
            }

            return partialBlock;
        });
    }, []);

    // Fetch the entire block tree on mount
    useEffect(() => {
        let mounted = true;

        const fetchBlockTree = async () => {
            setInitialContent(null);
            isLoadingChildrenRef.current = true;

            try {
                const res = await getBlockTreeApi(pageId);

                if (!mounted) return;

                if (res.success && res.data?.children?.length > 0) {
                    setInitialContent(mapToPartialBlocks(res.data.children));
                } else {
                    setInitialContent([{}] as PartialBlock[]);
                }
            } catch (error) {
                console.error('Failed to fetch block tree:', error);
                if (mounted) {
                    setInitialContent([{}] as PartialBlock[]);
                }
            } finally {
                if (mounted) {
                    isLoadingChildrenRef.current = false;
                }
            }
        };

        void fetchBlockTree();

        return () => {
            mounted = false;
        };
    }, [pageId, mapToPartialBlocks]);

    const pageTitle =
        currentPage?.content && typeof currentPage.content === 'object' && 'title' in currentPage.content
            ? String(currentPage.content.title)
            : 'Untitled';

    if (pageLoading) {
        return (
            <>
                <PageHeader title="Loading..." />
                <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </>
        );
    }

    if (!currentPage) {
        return (
            <>
                <PageHeader title="Error" />
                <div className="flex flex-1 items-center justify-center">
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
            <div className="flex-1 overflow-y-auto">
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
            </div>
        </>
    );
}
