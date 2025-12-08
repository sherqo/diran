'use client';

import * as React from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

import { updateBlockApi, deleteBlockApi } from '@/lib/api/block';
import { getTeamPagesApi } from '@/lib/api/team';
import type { TeamPage } from '@/lib/api/team';
import { showToast } from '@/lib/toast';

interface UseTeamPageActionsProps {
    teamId: string;
    teamPages: TeamPage[];
    setTeamPages: (pages: TeamPage[]) => void;
    canEdit: boolean;
}

export function useTeamPageActions({ teamId, teamPages, setTeamPages, canEdit }: UseTeamPageActionsProps) {
    const [deletingPageId, setDeletingPageId] = React.useState<string | null>(null);
    const [pageToDelete, setPageToDelete] = React.useState<{ id: string; name: string } | null>(null);
    const [pageToEdit, setPageToEdit] = React.useState<TeamPage | null>(null);
    const [activeId, setActiveId] = React.useState<string | null>(null);

    const pageIds = React.useMemo(() => teamPages.map(p => p.id), [teamPages]);
    const activePage = React.useMemo(() => teamPages.find(p => p.id === activeId), [teamPages, activeId]);

    const handleDragStart = React.useCallback(
        (event: DragStartEvent) => {
            if (!canEdit) return;
            setActiveId(event.active.id as string);
        },
        [canEdit]
    );

    const handleDragCancel = React.useCallback(() => {
        setActiveId(null);
    }, []);

    const handleDragEnd = React.useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            setActiveId(null);

            if (!canEdit || !over || active.id === over.id) return;

            const oldIndex = teamPages.findIndex(p => p.id === active.id);
            const newIndex = teamPages.findIndex(p => p.id === over.id);

            if (oldIndex === -1 || newIndex === -1) return;

            // Optimistic update: reorder locally first
            const previousPages = [...teamPages];
            const reorderedPages = arrayMove(teamPages, oldIndex, newIndex);
            setTeamPages(reorderedPages);

            // Fire API call in background (non-blocking) - exactly like nav-pages
            const prevId = newIndex === 0 ? null : (reorderedPages[newIndex - 1]?.id ?? null);
            const nextId = newIndex === reorderedPages.length - 1 ? null : (reorderedPages[newIndex + 1]?.id ?? null);

            updateBlockApi(active.id as string, { prevId, nextId })
                .then(result => {
                    if (!result.success) {
                        console.error('Failed to reorder page:', result.error);
                        setTeamPages(previousPages);
                        showToast('Failed to reorder page', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error reordering page:', error);
                    setTeamPages(previousPages);
                    showToast('An error occurred while reordering', 'error');
                });
        },
        [teamPages, setTeamPages, canEdit]
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

    const handleEditClick = React.useCallback(
        (page: TeamPage) => {
            if (!canEdit) return;
            setPageToEdit(page);
        },
        [canEdit]
    );

    const handleDeleteClick = React.useCallback(
        (pageId: string, pageName: string) => {
            if (!canEdit) return;
            setPageToDelete({ id: pageId, name: pageName });
        },
        [canEdit]
    );

    const handleDeleteConfirm = React.useCallback(async () => {
        if (!pageToDelete || !canEdit) return;

        setDeletingPageId(pageToDelete.id);
        setPageToDelete(null);

        // Optimistic update: remove the page locally before the API call
        const previousPages = [...teamPages];
        setTeamPages(teamPages.filter(p => p.id !== pageToDelete.id));

        try {
            const result = await deleteBlockApi(pageToDelete.id);
            if (result.success) {
                // Refresh pages to ensure consistency
                const refreshResult = await getTeamPagesApi(teamId);
                if (refreshResult.success) {
                    setTeamPages(refreshResult.data.pages);
                }
                showToast('Page deleted successfully', 'success');
            } else {
                console.error('Failed to delete page:', result.error);
                setTeamPages(previousPages);
                showToast('Failed to delete page', 'error');
            }
        } catch (error) {
            console.error('Error deleting page:', error);
            setTeamPages(previousPages);
            showToast('An error occurred while deleting the page', 'error');
        } finally {
            setDeletingPageId(null);
        }
    }, [pageToDelete, teamPages, teamId, setTeamPages, canEdit]);

    const handleCloseDeleteDialog = React.useCallback(() => {
        setPageToDelete(null);
    }, []);

    const handleCloseEditDialog = React.useCallback(
        (open: boolean) => {
            if (!open) {
                setPageToEdit(null);
                // Refresh pages after edit
                getTeamPagesApi(teamId).then(result => {
                    if (result.success) {
                        setTeamPages(result.data.pages);
                    }
                });
            }
        },
        [teamId, setTeamPages]
    );

    return {
        // State
        pageIds,
        activePage,
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
