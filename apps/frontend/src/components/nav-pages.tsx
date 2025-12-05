'use client';

import { FileText, Loader2, Plus, MoreHorizontal, Trash2, Link as LinkIcon, ArrowUpRight, Pencil } from 'lucide-react';
import * as React from 'react';
import { usePage, type Page } from '@/contexts/PageContext';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuAction,
    useSidebar,
} from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { deleteBlockApi, updateBlockApi } from '@/lib/api/block';
import { showToast } from '@/lib/toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────────────────────────────────────
// Sortable Page Item Component
// ─────────────────────────────────────────────────────────────────────────────

interface SortablePageItemProps {
    page: Page;
    isActive: boolean;
    isDeleting: boolean;
    isMobile: boolean;
    onCopyLink: (pageId: string) => void;
    onOpenInNewTab: (pageId: string) => void;
    onEditClick: (page: Page) => void;
    onDeleteClick: (pageId: string, pageName: string) => void;
}

function SortablePageItem({
    page,
    isActive,
    isDeleting,
    isMobile,
    onCopyLink,
    onOpenInNewTab,
    onEditClick,
    onDeleteClick,
}: SortablePageItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });
    const wasDraggingRef = React.useRef(false);

    // Track if we were dragging to prevent click navigation after drag
    React.useEffect(() => {
        if (isDragging) {
            wasDraggingRef.current = true;
        } else if (wasDraggingRef.current) {
            // Reset after a short delay to allow drag end to complete
            const timeout = setTimeout(() => {
                wasDraggingRef.current = false;
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [isDragging]);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const content = page.content as { title?: string; icon?: string };
    const pageName = content.title || 'Untitled';
    const pageIcon = content.icon;

    const handleClick = (e: React.MouseEvent) => {
        // Prevent navigation if we just finished dragging
        if (wasDraggingRef.current) {
            e.preventDefault();
        }
    };

    return (
        <SidebarMenuItem ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link scroll={false} href={`/page/${page.id}`} onClick={handleClick}>
                    {pageIcon ? <span className="text-base">{pageIcon}</span> : <FileText className="h-4 w-4" />}
                    <span>{pageName}</span>
                </Link>
            </SidebarMenuButton>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal />}
                        <span className="sr-only">More</span>
                    </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-lg" side={isMobile ? 'bottom' : 'right'} align={isMobile ? 'end' : 'start'}>
                    <DropdownMenuItem onClick={() => onEditClick(page)}>
                        <Pencil className="text-muted-foreground" />
                        <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCopyLink(page.id)}>
                        <LinkIcon className="text-muted-foreground" />
                        <span>Copy Link</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onOpenInNewTab(page.id)}>
                        <ArrowUpRight className="text-muted-foreground" />
                        <span>Open in New Tab</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => onDeleteClick(page.id, pageName)}
                        disabled={isDeleting}
                        className="text-destructive focus:text-destructive">
                        <Trash2 className="text-muted-foreground" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// NavPages Component
// ─────────────────────────────────────────────────────────────────────────────

export function NavPages() {
    const { pages, loading, currentPage, setPages } = usePage();
    const router = useRouter();
    const { isMobile } = useSidebar();
    const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
    const [deletingPageId, setDeletingPageId] = React.useState<string | null>(null);
    const [pageToDelete, setPageToDelete] = React.useState<{ id: string; name: string } | null>(null);
    const [pageToEdit, setPageToEdit] = React.useState<Page | null>(null);
    const [activeId, setActiveId] = React.useState<string | null>(null);

    // Memoize page IDs to prevent unnecessary re-renders
    const pageIds = React.useMemo(() => pages.map(p => p.id), [pages]);
    const activePage = React.useMemo(() => pages.find(p => p.id === activeId), [pages, activeId]);

    // DnD sensors for pointer and keyboard
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before starting drag
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) return;

        const oldIndex = pages.findIndex(p => p.id === active.id);
        const newIndex = pages.findIndex(p => p.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        // Optimistic update: reorder locally first using arrayMove
        const previousPages = [...pages];
        const reorderedPages = arrayMove(pages, oldIndex, newIndex);
        setPages(reorderedPages);

        // Fire API call in background (non-blocking)
        const prevId = newIndex === 0 ? null : (reorderedPages[newIndex - 1]?.id ?? null);
        const nextId = newIndex === reorderedPages.length - 1 ? null : (reorderedPages[newIndex + 1]?.id ?? null);

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
    };

    const handleCopyLink = (pageId: string) => {
        const url = `${window.location.origin}/page/${pageId}`;
        navigator.clipboard
            .writeText(url)
            .then(() => {
                showToast('Link copied to clipboard', 'success');
            })
            .catch(() => {
                showToast('Failed to copy link', 'error');
            });
    };

    const handleOpenInNewTab = (pageId: string) => {
        window.open(`/page/${pageId}`, '_blank');
    };

    const handleEditClick = (page: Page) => {
        setPageToEdit(page);
    };

    const handleDeleteClick = (pageId: string, pageName: string) => {
        setPageToDelete({ id: pageId, name: pageName });
    };

    const handleDeleteConfirm = async () => {
        if (!pageToDelete) return;

        setDeletingPageId(pageToDelete.id);
        setPageToDelete(null);

        // Optimistic update: remove the page locally before the API call and keep a copy for rollback
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
                // rollback optimistic removal
                setPages(previousPages);
                showToast('Failed to delete page', 'error');
            }
        } catch (error) {
            console.error('Error deleting page:', error);
            // rollback optimistic removal on exception
            setPages(previousPages);
            showToast('An error occurred while deleting the page', 'error');
        } finally {
            setDeletingPageId(null);
        }
    };

    if (loading) {
        return (
            <SidebarGroup>
                <SidebarGroupLabel>Pages</SidebarGroupLabel>
                <SidebarGroupContent>
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    return (
        <>
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
                        <SortableContext items={pageIds} strategy={verticalListSortingStrategy}>
                            <SidebarMenu>
                                {pages.map(page => (
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
                                {pages.length === 0 && <div className="text-muted-foreground px-2 py-4 text-sm">No pages yet</div>}
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
            <CreatePageDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
            <EditPageDialog open={!!pageToEdit} onOpenChange={open => !open && setPageToEdit(null)} page={pageToEdit} />

            <AlertDialog open={!!pageToDelete} onOpenChange={() => setPageToDelete(null)}>
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
