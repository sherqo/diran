'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

import { usePage, type Page } from '@/contexts/PageContext';
import { deleteBlockApi, updateBlockApi } from '@/lib/api/block';
import { showToast } from '@/lib/toast';

export function usePageActions() {
    const { pages, currentPage, setPages } = usePage();
    const router = useRouter();

    const [deletingPageId, setDeletingPageId] = React.useState<string | null>(null);
    const [pageToDelete, setPageToDelete] = React.useState<{ id: string; name: string } | null>(null);
    const [pageToEdit, setPageToEdit] = React.useState<Page | null>(null);
    const [activeId, setActiveId] = React.useState<string | null>(null);

    // Separate owned pages from shared pages
    const ownedPages = React.useMemo(() => pages.filter(p => p.role === 'OWNER'), [pages]);
    const sharedPages = React.useMemo(() => pages.filter(p => p.role !== 'OWNER'), [pages]);

    // Memoize page IDs for owned pages only (draggable)
    const ownedPageIds = React.useMemo(() => ownedPages.map(p => p.id), [ownedPages]);
    const activePage = React.useMemo(() => ownedPages.find(p => p.id === activeId), [ownedPages, activeId]);

    const handleDragStart = React.useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    }, []);

    const handleDragCancel = React.useCallback(() => {
        setActiveId(null);
    }, []);

    const handleDragEnd = React.useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            setActiveId(null);

            if (!over || active.id === over.id) return;

            const oldIndex = ownedPages.findIndex(p => p.id === active.id);
            const newIndex = ownedPages.findIndex(p => p.id === over.id);

            if (oldIndex === -1 || newIndex === -1) return;

            // Optimistic update: reorder locally first using arrayMove
            const previousPages = [...pages];
            const reorderedOwnedPages = arrayMove(ownedPages, oldIndex, newIndex);
            // Merge back with shared pages
            setPages([...reorderedOwnedPages, ...sharedPages]);

            // Fire API call in background (non-blocking)
            const prevId = newIndex === 0 ? null : (reorderedOwnedPages[newIndex - 1]?.id ?? null);
            const nextId = newIndex === reorderedOwnedPages.length - 1 ? null : (reorderedOwnedPages[newIndex + 1]?.id ?? null);

            updateBlockApi(active.id as string, { prevId, nextId })
                .then(result => {
                    if (!result.success) {
                        console.error('Failed to reorder page:', result.error);
                        setPages(previousPages);
                        showToast('Failed to reorder page', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error reordering page:', error);
                    setPages(previousPages);
                    showToast('An error occurred while reordering', 'error');
                });
        },
        [ownedPages, sharedPages, pages, setPages]
    );

    const handleCopyLink = React.useCallback((pageId: string) => {
        const url = `${window.location.origin}/page/${pageId}`;
        navigator.clipboard
            .writeText(url)
            .then(() => {
                showToast('Link copied to clipboard', 'success');
            })
            .catch(() => {
                showToast('Failed to copy link', 'error');
            });
    }, []);

    const handleOpenInNewTab = React.useCallback((pageId: string) => {
        window.open(`/page/${pageId}`, '_blank');
    }, []);

    const handleEditClick = React.useCallback((page: Page) => {
        setPageToEdit(page);
    }, []);

    const handleDeleteClick = React.useCallback((pageId: string, pageName: string) => {
        setPageToDelete({ id: pageId, name: pageName });
    }, []);

    const handleDeleteConfirm = React.useCallback(async () => {
        if (!pageToDelete) return;

        setDeletingPageId(pageToDelete.id);
        setPageToDelete(null);

        // Optimistic update: remove the page locally before the API call
        const previousPages = [...pages];
        setPages(prev => prev.filter(p => p.id !== pageToDelete.id));

        try {
            const result = await deleteBlockApi(pageToDelete.id);
            if (result.success) {
                if (currentPage?.id === pageToDelete.id) {
                    router.push('/home');
                }
                showToast('Page deleted successfully', 'success');
            } else {
                console.error('Failed to delete page:', result.error);
                setPages(previousPages);
                showToast('Failed to delete page', 'error');
            }
        } catch (error) {
            console.error('Error deleting page:', error);
            setPages(previousPages);
            showToast('An error occurred while deleting the page', 'error');
        } finally {
            setDeletingPageId(null);
        }
    }, [pageToDelete, pages, currentPage, setPages, router]);

    const handleCloseDeleteDialog = React.useCallback(() => {
        setPageToDelete(null);
    }, []);

    const handleCloseEditDialog = React.useCallback((open: boolean) => {
        if (!open) setPageToEdit(null);
    }, []);

    return {
        // State
        ownedPages,
        sharedPages,
        ownedPageIds,
        activePage,
        currentPage,
        deletingPageId,
        pageToDelete,
        pageToEdit,

        // Drag handlers
        handleDragStart,
        handleDragEnd,
        handleDragCancel,

        // Page actions
        handleCopyLink,
        handleOpenInNewTab,
        handleEditClick,
        handleDeleteClick,
        handleDeleteConfirm,
        handleCloseDeleteDialog,
        handleCloseEditDialog,
    };
}
