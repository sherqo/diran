'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { usePage } from '@/contexts/PageContext';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Editor } from '@/components/features/editor/DynamicEditor';
import { EditablePageTitle } from '@/components/features/editable-page-title';
import type { PartialBlock, BlockNoteEditor } from '@blocknote/core';
import type { EmbeddedBlockContent, ApiBlock } from '@/shared/types/block';
import { getBlockTreeApi } from '@/lib/api/block';
import NotFoundInline from '@/components/not-found-inline';

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
    const mapToPartialBlocks = useCallback((blocks: ApiBlock[]): PartialBlock[] => {
        return blocks.map(block => {
            // Extract props from content if they were embedded
            let content: unknown = block.content;
            let props: Record<string, unknown> | undefined = undefined;

            // Check if content uses our embedded format
            if (content && typeof content === 'object' && '__props' in content) {
                const embedded = content as EmbeddedBlockContent;
                props = embedded.__props as Record<string, unknown>;
                // __content can be: array (text blocks), object (tables), or undefined (embeds)
                content = embedded.__content;
            }

            // Build the partial block - only include content if it exists
            // Embeds (image, video) have undefined content
            const partialBlock = {
                id: block.id,
                type: block.type, // BlockNote types are already in correct format (camelCase)
                ...(content !== undefined && content !== null && { content }),
                ...(props && { props }),
            } as PartialBlock;

            if (block.children && block.children.length > 0) {
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

    const pageIcon =
        currentPage?.content && typeof currentPage.content === 'object' && 'icon' in currentPage.content
            ? String(currentPage.content.icon)
            : undefined;

    if (pageLoading) {
        return (
            <>
                <PageHeader title="" loading />
                <div className="flex-1 overflow-y-auto">
                    <div className="container mx-auto max-w-4xl px-4 pt-10 pb-40">
                        {/* Title skeleton - icon above title */}
                        <div className="mb-4">
                            <Skeleton className="mb-2 h-12 w-12 rounded-lg" />
                            <Skeleton className="h-10 w-72" />
                        </div>
                        {/* Content skeleton */}
                        <div className="space-y-4 pt-4">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-4/5" />
                            <Skeleton className="h-5 w-3/4" />
                            <div className="py-2" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-2/3" />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!currentPage) {
        return <NotFoundInline />;
    }

    return (
        <>
            <PageHeader title={pageTitle} icon={pageIcon} pageId={pageId} role={currentPage.role} isTeamPage={currentPage.isTeamPage} />
            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto max-w-4xl px-4 pt-10 pb-40">
                    <EditablePageTitle
                        pageId={pageId}
                        initialTitle={pageTitle}
                        initialIcon={pageIcon}
                        editable={currentPage.role !== 'VIEWER'}
                    />

                    {initialContent === null ? (
                        <div className="space-y-4 pt-4">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-4/5" />
                            <Skeleton className="h-5 w-3/4" />
                            <div className="py-2" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-2/3" />
                        </div>
                    ) : (
                        <Editor
                            key={pageId}
                            pageId={pageId}
                            initialContent={initialContent}
                            editorRef={editorRef}
                            isLoadingChildrenRef={isLoadingChildrenRef}
                            editable={currentPage.role !== 'VIEWER'}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
