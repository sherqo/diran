'use client';

import { FileText, Loader2, Plus, MoreHorizontal, Trash2, Link as LinkIcon, ArrowUpRight } from 'lucide-react';
import * as React from 'react';
import { usePage } from '@/contexts/PageContext';
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
import { deleteBlockApi } from '@/lib/api/block';
import { showToast } from '@/lib/toast';
import Link from 'next/link';

export function NavPages() {
    const { pages, loading, currentPageId, fetchPages, setCurrentPageId } = usePage();
    const { isMobile } = useSidebar();
    const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
    const [deletingPageId, setDeletingPageId] = React.useState<string | null>(null);
    const [pageToDelete, setPageToDelete] = React.useState<{ id: string; name: string } | null>(null);

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

    const handleDeleteClick = (pageId: string, pageName: string) => {
        setPageToDelete({ id: pageId, name: pageName });
    };

    const handleDeleteConfirm = async () => {
        if (!pageToDelete) return;

        setDeletingPageId(pageToDelete.id);
        setPageToDelete(null);

        try {
            const result = await deleteBlockApi(pageToDelete.id);
            if (result.success) {
                // If we're deleting the current page, clear the selection
                if (currentPageId === pageToDelete.id) {
                    setCurrentPageId(null);
                }
                // Refresh the pages list
                await fetchPages();
                showToast('Page deleted successfully', 'success');
            } else {
                console.error('Failed to delete page:', result.error);
                showToast('Failed to delete page', 'error');
            }
        } catch (error) {
            console.error('Error deleting page:', error);
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
                    <SidebarMenu>
                        {pages.map(page => {
                            const pageName = (page.content as { title?: string }).title || 'Untitled';
                            const isDeleting = deletingPageId === page.id;
                            return (
                                <SidebarMenuItem key={page.id}>
                                    <SidebarMenuButton asChild isActive={currentPageId === page.id}>
                                        <Link href={`/page/${page.id}`}>
                                            <FileText className="h-4 w-4" />
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
                                        <DropdownMenuContent
                                            className="w-56 rounded-lg"
                                            side={isMobile ? 'bottom' : 'right'}
                                            align={isMobile ? 'end' : 'start'}>
                                            <DropdownMenuItem onClick={() => handleCopyLink(page.id)}>
                                                <LinkIcon className="text-muted-foreground" />
                                                <span>Copy Link</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleOpenInNewTab(page.id)}>
                                                <ArrowUpRight className="text-muted-foreground" />
                                                <span>Open in New Tab</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleDeleteClick(page.id, pageName)}
                                                disabled={isDeleting}
                                                className="text-destructive focus:text-destructive">
                                                <Trash2 className="text-muted-foreground" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SidebarMenuItem>
                            );
                        })}
                        {pages.length === 0 && <div className="text-muted-foreground px-2 py-4 text-sm">No pages yet</div>}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
            <CreatePageDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
            
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
