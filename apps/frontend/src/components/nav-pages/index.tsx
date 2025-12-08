'use client';

import * as React from 'react';
import { FileText, Plus, Users } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { usePage } from '@/contexts/PageContext';
import {
    useSidebar,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CreatePageDialog } from '@/components/features/create-page-dialog';
import { EditPageDialog } from '@/components/features/edit-page-dialog';

import { SortablePageItem } from './page-item';
import { SharedPageItem } from './shared-page-item';
import { usePageActions } from './use-page-actions';

export function NavPages() {
    const { loading } = usePage();
    const { isMobile } = useSidebar();
    const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

    const {
        ownedPages,
        sharedPages,
        ownedPageIds,
        activePage,
        currentPage,
        deletingPageId,
        pageToDelete,
        pageToEdit,
        handleDragStart,
        handleDragEnd,
        handleDragCancel,
        handleCopyLink,
        handleOpenInNewTab,
        handleEditClick,
        handleDeleteClick,
        handleDeleteConfirm,
        handleCloseDeleteDialog,
        handleCloseEditDialog,
    } = usePageActions();

    // DnD sensors for pointer and keyboard
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    if (loading) {
        return (
            <SidebarGroup>
                <SidebarGroupLabel>Pages</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {[1, 2, 3, 4].map(i => (
                            <SidebarMenuItem key={i}>
                                <SidebarMenuButton>
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-4 w-28" />
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    return (
        <>
            {/* Owned Pages */}
            <SidebarGroup>
                <SidebarGroupLabel>
                    <div className="flex w-full items-center justify-between">
                        <span>Pages</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setCreateDialogOpen(true)}
                            title="Create new page">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragCancel={handleDragCancel}>
                        <SortableContext items={ownedPageIds} strategy={verticalListSortingStrategy}>
                            <SidebarMenu>
                                {ownedPages.map(page => (
                                    <SortablePageItem
                                        key={page.id}
                                        page={page}
                                        isActive={currentPage?.id === page.id}
                                        isDeleting={deletingPageId === page.id}
                                        isMobile={isMobile}
                                        onCopyLink={handleCopyLink}
                                        onOpenInNewTab={handleOpenInNewTab}
                                        onEditClick={handleEditClick}
                                        onDeleteClick={handleDeleteClick}
                                    />
                                ))}
                                {ownedPages.length === 0 && <div className="text-muted-foreground px-2 py-4 text-sm">No pages yet</div>}
                            </SidebarMenu>
                        </SortableContext>
                        <DragOverlay>
                            {activePage ? (
                                <div className="bg-sidebar rounded-md border px-2 py-1.5 shadow-lg">
                                    <div className="flex items-center gap-2">
                                        {(activePage.content as { icon?: string }).icon ? (
                                            <span className="text-base">{(activePage.content as { icon?: string }).icon}</span>
                                        ) : (
                                            <FileText className="h-4 w-4" />
                                        )}
                                        <span>{(activePage.content as { title?: string }).title || 'Untitled'}</span>
                                    </div>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </SidebarGroupContent>
            </SidebarGroup>

            {/* Shared with me */}
            {sharedPages.length > 0 && (
                <SidebarGroup>
                    <SidebarGroupLabel>
                        <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            <span>Shared with me</span>
                        </div>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sharedPages.map(page => (
                                <SharedPageItem
                                    key={page.id}
                                    page={page}
                                    isActive={currentPage?.id === page.id}
                                    isMobile={isMobile}
                                    onCopyLink={handleCopyLink}
                                    onOpenInNewTab={handleOpenInNewTab}
                                />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            )}

            {/* Dialogs */}
            <CreatePageDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
            <EditPageDialog open={!!pageToEdit} onOpenChange={handleCloseEditDialog} page={pageToEdit} />

            <AlertDialog open={!!pageToDelete} onOpenChange={handleCloseDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Page</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{pageToDelete?.name}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction destructive onClick={handleDeleteConfirm}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
