'use client';

import { FileText, Loader2, Plus } from 'lucide-react';
import * as React from 'react';
import { usePage } from '@/contexts/PageContext';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { CreatePageDialog } from '@/components/features/create-page-dialog';
import Link from 'next/link';

export function NavPages() {
    const { pages, loading, currentPageId } = usePage();
    const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

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
                            return (
                                <SidebarMenuItem key={page.id}>
                                    <SidebarMenuButton asChild isActive={currentPageId === page.id}>
                                        <Link href={`/page/${page.id}`}>
                                            <FileText className="h-4 w-4" />
                                            <span>{pageName}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                        {pages.length === 0 && <div className="text-muted-foreground px-2 py-4 text-sm">No pages yet</div>}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
            <CreatePageDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
        </>
    );
}
